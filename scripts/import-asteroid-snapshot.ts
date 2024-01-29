import {
  SnapshotAsteroid,
  convertSnapshotAsteroid,
} from '../src/lib/influence-api-types'
import { db } from '@/server/db'

const snapshotPath = '../asteroid-snapshot.json'
if (!snapshotPath) {
  console.error('No snapshot path provided')
  process.exit(1)
}
console.log(`Importing asteroids from "${snapshotPath}"`)
const snapshotAsteroids = (await import(snapshotPath))
  .default as SnapshotAsteroid[]

const BATCH_SIZE = 100

const runImport = async () => {
  console.log('Running asteroid snapshot import')
  let i = 0
  let batchStart = new Date().getTime()

  while (i < snapshotAsteroids.length) {
    const updatedCount = await db
      .$transaction(
        snapshotAsteroids.slice(i, i + BATCH_SIZE).map((a) => {
          const asteroid = convertSnapshotAsteroid(a)
          return db.asteroid.update({
            where: { id: a.i },
            data: {
              salePrice: asteroid.salePrice,
              orbitalPeriod: asteroid.orbitalPeriod,
            },
          })
        })
      )
      .then((r) => r.length)

    const batchDuration = (new Date().getTime() - batchStart) / 1000
    console.log(
      `[${i}] Imported ${updatedCount} asteroids from snapshot in ${batchDuration} seconds`
    )
    batchStart = new Date().getTime()
    i += BATCH_SIZE
  }

  await db.asteroid.updateMany({
    where: {
      ownerAddress: { not: null },
    },
    data: {
      salePrice: null,
    },
  })
}

await runImport()
