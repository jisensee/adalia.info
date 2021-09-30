import { https } from 'follow-redirects'
import { PassThrough, Writable } from 'node:stream'
import readline from 'readline'
import { ApiAsteroid, convertApiAsteroidToInternal } from './api-asteroid'
import { AsteroidImporter, ImportType } from './asteroid-import'

const BATCH_SIZE = 25_000

const downloadJson = (downloadUrl: string, stream: Writable) =>
  https.get(downloadUrl, (res) => {
    res.pipe(stream)
  })

const getDataDumpAsteroidImporter = (
  dataDumpUrl: string
): AsteroidImporter => ({
  run: async (persist) => {
    const stream = new PassThrough()
    downloadJson(dataDumpUrl, stream)
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    })
    let i = 0
    let asteroids = []
    let batchStart = new Date().getTime()
    for await (const line of rl) {
      const apiAsteroid: ApiAsteroid = JSON.parse(line)
      const asteroid = convertApiAsteroidToInternal(apiAsteroid)
      asteroids.push(asteroid)
      i++
      if (i % BATCH_SIZE === 0) {
        await persist(asteroids)
        const batchDuration = (new Date().getTime() - batchStart) / 1000
        console.log(
          `Imported ${asteroids.length} asteroid from data dump in ${batchDuration} seconds`
        )
        batchStart = new Date().getTime()
        asteroids = []
      }
    }
  },
  type: ImportType.StaticDump,
})

export default getDataDumpAsteroidImporter
