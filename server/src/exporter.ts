import { CronJob } from 'cron'
import crypto from 'crypto'
import { createWriteStream } from 'fs'
import * as fs from 'fs/promises'
import { Db } from 'mongodb'
import path from 'path'
import AsteroidsDataSource from './db/AsteroidsDataSource'
import {
  AsteroidFilterInput,
  AsteroidSortingInput,
  ExportFormat,
  Maybe,
} from './types'

const asteroidExportBaseFilename = 'adalia-info-asteroids'
const fullAsteroidExportFilename = `${asteroidExportBaseFilename}-full`
const exportDir = '/exports'

// 1 hour
const maxExportAge = 1 * 60 * 60 * 1_000

const getExtension = (format: ExportFormat) => {
  switch (format) {
    case ExportFormat.Json:
      return 'json'
    case ExportFormat.Csv:
      return 'csv'
  }
}

const fullExports = [ExportFormat.Json]
  .map(getExtension)
  .map((ext) => `${fullAsteroidExportFilename}.${ext}`)

const getExportPath = (filename: string) => path.resolve(exportDir, filename)

const getFullExportPath = (format: ExportFormat) =>
  getExportPath(`${fullAsteroidExportFilename}.${getExtension(format)}`)

const getPath = (
  filters: Maybe<AsteroidFilterInput>,
  sorting: Maybe<AsteroidSortingInput>,
  format: ExportFormat
) => {
  if (!filters && !sorting) {
    return getFullExportPath(format)
  }

  let extension = getExtension(format)
  let params = extension
  if (filters) {
    params += JSON.stringify(filters)
  }
  if (sorting) {
    params += JSON.stringify(sorting)
  }

  const hash = crypto.createHash('md5').update(params).digest('hex')
  return getExportPath(`${asteroidExportBaseFilename}-${hash}.${extension}`)
}

const doesExportExist = async (filename: string): Promise<boolean> => {
  const p = path.resolve(exportDir, filename)
  return fs
    .stat(p)
    .then(() => true)
    .catch(() => false)
}

const writeStream = (
  filters: Maybe<AsteroidFilterInput>,
  sorting: Maybe<AsteroidSortingInput>,
  format: ExportFormat
) => createWriteStream(getPath(filters, sorting, format))

const writeStreamFull = (format: ExportFormat) =>
  createWriteStream(getFullExportPath(format))

const cleanup = async () => {
  const exports = await fs.readdir(exportDir)
  const nowEpoch = new Date().valueOf()
  const toCheck = exports
    .filter((f) => !fullExports.includes(f))
    .map(getExportPath)
  let deleted = 0
  const shouldDelete = async (f: string) => {
    const s = await fs.stat(f)
    const fileEpoch = s.birthtime.valueOf()
    return nowEpoch - fileEpoch > maxExportAge
  }

  for (const f of toCheck) {
    if (await shouldDelete(f)) {
      fs.rm(getExportPath(f))
      deleted += 1
    }
  }

  if (deleted > 0) {
    console.log(`Deleted ${deleted} old exports`)
  }
}

const startCleanupJob = () => {
  // Run every hour at minute 0
  const job = new CronJob('0 * * * *', async () => {
    try {
      await cleanup()
    } catch (err) {
      console.error('Error when cleaning up old exports', err)
    }
  })
  job.start()
  console.log('Started export cleanup job')
}

const init = async (db: Db) => {
  const ds = new AsteroidsDataSource(db.collection('asteroids'))
  await fs.mkdir(exportDir)

  const genExport = (format: ExportFormat) => {
    const writer = createWriteStream(
      getExportPath(`${fullAsteroidExportFilename}.${getExtension(format)}`)
    )
    console.log(`Generating initial full ${format} asteroid export...`)
    ds.exportAsteroids(null, null, format, true, writer)
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Finished full ${format} export generation`)
        resolve(null)
      })
      writer.on('error', (error) => {
        console.log(`Error during full ${format} export generation`, error)
        reject()
      })
    })
  }

  await Promise.all([ExportFormat.Json, ExportFormat.Csv].map(genExport))

  startCleanupJob()
}

export {
  getExportPath,
  getPath,
  getFullExportPath,
  doesExportExist,
  writeStream,
  writeStreamFull,
  init,
}
