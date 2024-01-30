import { Asteroid, AsteroidScanStatus } from '@prisma/client'
import { Asteroid as SdkAsteroid } from '@influenceth/sdk'
import {
  ApiAsteroid,
  convertBonusType,
  convertChain,
  convertRarity,
  convertScanStatus,
  getApiBonuses,
} from '../lib/influence-api-types'
import { getAsteroidPage } from '../lib/influence-api'
import { inngest } from './client'
import { db } from '@/server/db'

const API_BATCH_SIZE = parseInt(
  process.env.ASTEROID_SYNC_API_BATCH_SIZE ?? '500',
  10
)
const DB_BATCH_SIZE = parseInt(
  process.env.ASTEROID_SYNC_DB_BATCH_SIZE ?? '50',
  10
)

export const startScheduledAsteroidSync = inngest.createFunction(
  { id: 'start-scheduled-asteroid-sync' },
  { cron: '0 8 * * *' },
  async ({ step }) => {
    await step.sendEvent('app/start-asteroid-sync', [
      { name: 'app/start-asteroid-sync' },
    ])
  }
)

export const startAsteroidSync = inngest.createFunction(
  { id: 'start-asteroid-sync' },
  { event: 'app/start-asteroid-sync' },
  async ({ step, logger }) => {
    if (!process.env.INFLUENCE_API_ACCESS_TOKEN) {
      logger.warn('Skipping asteroid sync, no influence access token')
      return
    }

    const { totalCount } = await getAsteroidPage(1)
    const workerCount = Math.ceil(totalCount / DB_BATCH_SIZE)

    logger.info(`Starting full asteroid sync for ${totalCount} asteroids`)

    const importRun = await db.asteroidImportRun.create({
      data: {
        start: new Date(),
        runningWorkers: workerCount,
      },
    })

    logger.info(
      `Created import run ${
        importRun.id
      } starting at ${importRun.start.toUTCString()} with ${workerCount} workers`
    )

    await step.sendEvent('app/update-asteroid-page', {
      name: 'app/update-asteroid-page',
      data: {
        runId: importRun.id,
        page: 1,
        receivedAsteroids: 0,
      },
    })
  }
)

export const updateAsteroidPage = inngest.createFunction(
  { id: 'update-asteroid-page', concurrency: 1 },
  { event: 'app/update-asteroid-page' },
  async ({ event, step, logger }) => {
    const searchAfter = event.data?.searchAfter as number[] | undefined
    const page = (event.data?.page ?? 0) as number
    const runId = (event.data?.runId ?? 0) as number
    const receivedAsteroids = (event.data?.receivedAsteroids ?? 0) as number

    const { asteroids: apiAsteroids, nextSearchAfter } = await getAsteroidPage(
      API_BATCH_SIZE,
      searchAfter
    )

    const newReceivedAsteroids = receivedAsteroids + apiAsteroids.length

    const batchCount = Math.ceil(apiAsteroids.length / DB_BATCH_SIZE)
    if (batchCount > 0) {
      logger.info(
        `Got ${apiAsteroids.length} asteroids from API for page ${page}, total received: ${newReceivedAsteroids}, nextSearchAfter: ${nextSearchAfter}`
      )

      const events = Array.from({ length: batchCount }).map((_, i) => {
        const start = i * DB_BATCH_SIZE
        const end = Math.min(start + DB_BATCH_SIZE, apiAsteroids.length)
        return {
          name: 'app/update-asteroids-db',
          data: {
            apiAsteroids: apiAsteroids.slice(start, end),
            runId,
          },
        }
      })

      await step.sendEvent('app/update-asteroids-db', events)
    }

    if (nextSearchAfter) {
      await step.sendEvent('app/update-asteroid-page', {
        name: 'app/update-asteroid-page',
        data: {
          searchAfter: nextSearchAfter,
          runId,
          page: page + 1,
          receivedAsteroids: newReceivedAsteroids,
        },
      })
    }
  }
)

export const updateAsteroidsDb = inngest.createFunction(
  { id: 'update-asteroids-db', concurrency: 10 },
  { event: 'app/update-asteroids-db' },
  async ({ event, logger }) => {
    const apiAsteroids =
      (event.data?.apiAsteroids as ApiAsteroid[] | undefined) ?? []
    const runId = (event.data?.runId ?? 0) as number

    const apiIds = apiAsteroids.map((a) => a.id)
    const existingAsteroids = new Map(
      (
        await db.asteroid.findMany({
          where: {
            id: {
              in: apiIds,
            },
          },
        })
      ).map((a) => [a.id, a])
    )
    await updateAsteroids(apiAsteroids, existingAsteroids)

    const run = await db.asteroidImportRun.update({
      where: {
        id: runId,
      },
      data: {
        runningWorkers: {
          decrement: 1,
        },
      },
    })

    logger.info(
      `Updated ${apiAsteroids.length} asteroids in DB, ${run.runningWorkers} workers left`
    )

    if (run.runningWorkers === 0) {
      const end = new Date()
      const duration = (end.getTime() - run.start.getTime()) / 1000
      await db.asteroidImportRun.update({
        where: {
          id: runId,
        },
        data: { end },
      })

      logger.info(`Asteroid sync finished in ${duration.toLocaleString()}s`)
    }
  }
)

const updateAsteroids = async (
  apiAsteroids: ApiAsteroid[],
  existingAsteroids: Map<number, Asteroid>
) => {
  const updates = apiAsteroids.flatMap((apiAsteroid) => {
    const existingAsteroid = existingAsteroids.get(apiAsteroid.id)
    if (!existingAsteroid) {
      return []
    }
    return updateAsteroid(apiAsteroid, existingAsteroid)
  })

  return Promise.all(updates)
}

const updateAsteroid = (
  apiAsteroid: ApiAsteroid,
  existingAsteroid: Asteroid
) => {
  const newScanStatus = convertScanStatus(apiAsteroid.Celestial.scanStatus)
  const scanChanged = newScanStatus !== existingAsteroid.scanStatus
  const apiBonuses = getApiBonuses(apiAsteroid)
  const newRarity =
    newScanStatus !== AsteroidScanStatus.UNSCANNED
      ? convertRarity(SdkAsteroid.getRarity(apiBonuses))
      : null

  const wasLongRangeScanned =
    scanChanged && newScanStatus === AsteroidScanStatus.LONG_RANGE_SCAN

  const newChain = convertChain(apiAsteroid.Nft.chain)
  const newOwner = apiAsteroid.Nft.owner?.toLowerCase()

  const ownerChanged = !!newOwner && existingAsteroid.ownerAddress !== newOwner

  if (!newOwner) {
    console.log('UNOWNED ASTEROID', JSON.stringify(apiAsteroid, null, 2))
  }

  return db.asteroid.update({
    where: {
      id: apiAsteroid.id,
    },
    data: {
      name: apiAsteroid?.Name?.name,
      ownerAddress: newOwner,
      blockchain: newChain,
      rarity: newRarity,
      scanStatus: newScanStatus,
      lastScan: scanChanged ? new Date() : undefined,
      salePrice: newOwner ? null : undefined,
      ownerChanges:
        ownerChanged && newChain
          ? {
              create: {
                fromAddress: existingAsteroid.ownerAddress,
                toAddress: newOwner,
                fromChain: existingAsteroid.blockchain,
                toChain: newChain,
                timestamp: new Date(),
              },
            }
          : undefined,
      bonuses: wasLongRangeScanned
        ? {
            createMany: {
              data: apiBonuses.map((b) => ({
                type: convertBonusType(b.type),
                level: b.level,
                modifier: b.modifier,
              })),
            },
          }
        : undefined,
    },
  })
}
