import { BulkWriteUpdateOneOperation, Collection, Db } from 'mongodb'
import { Asteroid } from '../types'
import { AsteroidImportInfo, ImportType } from './asteroid-import'
import getDataDumpAsteroidImporter from './data-dump-asteroid-importer'
import randomImporter from './random-asteroid-importer'

const setupIndices = async (collection: Collection<Asteroid>) => {
  const keys: Array<keyof Asteroid> = [
    'id',
    'name',
    'owner',
    'radius',
    'surfaceArea',
    'semiMajorAxis',
    'inclination',
    'orbitalPeriod',
    'spectralType',
    'eccentricity',
    'size',
    'baseName',
    'scanned',
  ]
  await collection.createIndexes(keys.map((key) => ({ key: { [key]: 1 } })))
}

const getImporter = (lastImport: AsteroidImportInfo | null) => {
  const dataDumpUrl = process.env.ASTEROID_DATA_DUMP_URL
  if (dataDumpUrl) {
    console.log('Data dump url provided, importing from ', dataDumpUrl)
    return getDataDumpAsteroidImporter(dataDumpUrl)
  }

  if (!lastImport) {
    console.log(
      'No previous import found, using mock data import since no api key or data dump url provided.'
    )
    return randomImporter
  }

  console.log('No need to import data right now.')
  return null
}

const updateImportInfo = async (
  importInfoCollection: Collection<AsteroidImportInfo>,
  importType: ImportType
) => {
  const query = { type: importType }
  const lastRun = new Date()
  const update = { $set: { lastRun } }
  await importInfoCollection.updateOne(query, update, { upsert: true })
  console.log(`Saving last asteroid run at ${lastRun.toISOString()}`)
}

const getLastImport = async (
  importInfoCollection: Collection<AsteroidImportInfo>
) => {
  const lastImports = await importInfoCollection
    .find({})
    .sort({ lastRun: -1 })
    .limit(1)
    .toArray()
  return lastImports.length === 0 ? null : lastImports[0]
}

export const runImport = async (db: Db) => {
  const asteroidCollection = db.collection('asteroids')
  const importInfoCollection = db.collection<AsteroidImportInfo>(
    'asteroid-import-info'
  )
  const lastImport = await getLastImport(importInfoCollection)

  const importer = getImporter(lastImport)
  if (!importer) {
    return
  }

  if (!lastImport) {
    console.log('No previous asteroid import found, setting up indexes...')
    await setupIndices(asteroidCollection)
    console.log('Indexes created!')
  }

  console.log('Running asteroid import...')
  const importStartTime = new Date().getTime()
  let totalUpdated = 0
  await importer.run(async (asteroids) => {
    const batchStartTime = new Date().getTime()
    const getUpdateOperation = (
      asteroid: Asteroid
    ): BulkWriteUpdateOneOperation<Asteroid> => ({
      updateOne: {
        filter: { id: asteroid.id },
        update: { $set: asteroid },
        upsert: true,
      },
    })
    const writeOperations = asteroids.map(getUpdateOperation)
    const writeResult = await asteroidCollection.bulkWrite(writeOperations)
    const batchTime = (new Date().getTime() - batchStartTime) / 1000
    console.log(
      `Updated batch of ${
        writeResult.upsertedCount ?? 0
      } asteroids in ${batchTime} seconds`
    )
    totalUpdated += asteroids.length
    console.log(`Total processed asteroids: ${totalUpdated}`)
  })
  const totalTime = (new Date().getTime() - importStartTime) / 1000
  console.log(`Finished asteroid import in ${totalTime} seconds!`)
  await updateImportInfo(importInfoCollection, importer.type)
}
