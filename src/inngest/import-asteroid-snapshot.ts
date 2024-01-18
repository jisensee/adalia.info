import { Prisma } from '@prisma/client'
import { SnapshotAsteroid, convertSnapshotAsteroid } from './types'
import { db } from '@/server/db'

const snapshotPath = '../../asteroid-snapshot.json'
if (!snapshotPath) {
  console.error('No snapshot path provided')
  process.exit(1)
}
console.log(`Importing asteroids from "${snapshotPath}"`)
const snapshotAsteroids = (await import(snapshotPath))
  .default as SnapshotAsteroid[]

const BATCH_SIZE = 50_000

let asteroids: Prisma.AsteroidCreateManyInput[] = []

const runImport = async () => {
  console.log('Running asteroid snapshot import')
  let i = 0
  let batchStart = new Date().getTime()
  await db.asteroidBonus.deleteMany({})
  await db.asteroid.deleteMany({})

  for (const snapshotAsteroid of snapshotAsteroids) {
    const asteroid = convertSnapshotAsteroid(snapshotAsteroid)
    asteroids.push(asteroid)
    i++
    if (i % BATCH_SIZE === 0) {
      await db.asteroid.createMany({ data: asteroids })
      const batchDuration = (new Date().getTime() - batchStart) / 1000
      console.log(
        `Imported ${asteroids.length} asteroids from snapshot in ${batchDuration} seconds`
      )
      batchStart = new Date().getTime()
      asteroids = []
    }
  }
}

await runImport()
