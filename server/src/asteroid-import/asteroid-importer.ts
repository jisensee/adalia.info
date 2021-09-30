import { CronJob } from 'cron'
import { DataSources } from '../context'
import { getApiImporter } from './api-asteroid-importer'
import { AsteroidImportInfo } from './asteroid-import'
import getDataDumpAsteroidImporter from './data-dump-asteroid-importer'
import randomImporter from './random-asteroid-importer'

const getImporter = (lastImport: AsteroidImportInfo | null) => {
  const dataDumpUrl = process.env.ASTEROID_DATA_DUMP_URL
  if (dataDumpUrl) {
    console.log('Data dump url provided, importing from ', dataDumpUrl)
    return getDataDumpAsteroidImporter(dataDumpUrl)
  }

  if (!lastImport) {
    console.log(
      'No previous import found, using mock data import since no data dump url provided.'
    )
    return randomImporter
  }

  console.log('No need to import data right now.')
  return null
}

export const runInitialDataImport = async ({
  asteroids,
  asteroidImports,
}: DataSources) => {
  const lastImport = await asteroidImports.getLast()

  const importer = getImporter(lastImport)
  if (!importer) {
    return
  }

  if (!lastImport) {
    console.log('No previous asteroid import found, setting up indexes...')
    await asteroids.createIndexes()
    console.log('Indexes created!')
  }

  console.log('Running asteroid import...')
  const importStartTime = new Date().getTime()
  let totalUpdated = 0
  await importer.run(async (rocks) => {
    const updated = await asteroids.updateAsteroids(rocks)
    totalUpdated += updated
  })
  const totalTime = (new Date().getTime() - importStartTime) / 1000
  console.log(`Finished asteroid import in ${totalTime} seconds!`)
  await asteroidImports.updateImportInfo(importer.type)
}

export const startApiImportJob = async (
  { asteroids, asteroidImports }: DataSources,
  afterRun: () => void
) => {
  const apiImporter = getApiImporter()
  if (!apiImporter) {
    console.log('Api importer is not active')
    return
  }

  const updateFromApi = async () => {
    let totalUpdated = 0
    const start = new Date().getTime()
    await apiImporter.run(async (rocks) => {
      const updated = await asteroids.updateAsteroids(rocks)
      totalUpdated += updated
    })
    const duration = (new Date().getTime() - start) / 1000
    console.log(
      `Updated ${totalUpdated} asteroids from the influence API in ${duration} seconds`
    )
    await asteroidImports.updateImportInfo(apiImporter.type)
  }

  await updateFromApi()

  // Run daily 08:00 UTC
  const job = new CronJob({
    cronTime: '0 8 * * *',
    onTick: async () => {
      await updateFromApi()
      afterRun()
    },
    utcOffset: 0,
  })
  job.start()
  console.log('Started asteroid API import job')
}
