import { Asteroid, AsteroidBonus } from '@prisma/client'
import { ApiAsteroid, convertApiAsteroid } from './api-asteroid'
import { db } from '@/server/db'

const snapshotPath = process.argv[2]
if (!snapshotPath) {
  console.error('No snapshot path provided')
  process.exit(1)
}
const apiAsteroids = (await import(snapshotPath)) as ApiAsteroid[]

const BATCH_SIZE = 50_000

let asteroids: Asteroid[] = []
const asteroidBonuses: Omit<AsteroidBonus, 'id'>[] = []

const runImport = async () => {
  console.log('Running asteroid import')
  let i = 0
  let batchStart = new Date().getTime()
  await db.asteroidBonus.deleteMany({})
  await db.asteroid.deleteMany({})

  for (const apiAsteroid of apiAsteroids) {
    const [asteroid, bonuses] = convertApiAsteroid(apiAsteroid)
    asteroids.push(asteroid)
    asteroidBonuses.push(...bonuses)
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

  const start = new Date().getTime()
  console.log('Creating bonuses')
  await db.asteroidBonus.createMany({ data: asteroidBonuses })
  console.log(
    `Created ${asteroidBonuses.length} bonuses in ${
      (new Date().getTime() - start) / 1000
    } seconds`
  )
}

await runImport()
