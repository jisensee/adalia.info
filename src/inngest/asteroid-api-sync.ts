import { Asteroid, AsteroidScanStatus } from '@prisma/client'
import { Asteroid as SdkAsteroid } from '@influenceth/sdk'
import {
  ApiAsteroid,
  convertBonusType,
  convertChain,
  convertRarity,
  convertScanStatus,
  getApiBonuses,
} from './types'
import { getAsteroidPage } from './influence-api'
import { inngest } from './client'
import { db } from '@/server/db'

const BATCH_SIZE = parseInt(
  process.env.ASTEROID_API_SYNC_BATCH_SIZE ?? '50',
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
    logger.info('Starting full asteroid sync')

    const importRun = await db.asteroidImportRun.create({
      data: {
        start: new Date(),
        runningWorkers: 0,
      },
    })

    step.sendEvent('app/update-asteroid-page', {
      name: 'app/update-asteroid-page',
      data: {
        runId: importRun.id,
      },
    })
  }
)

export const updateAsteroidPage = inngest.createFunction(
  { id: 'update-asteroid-page', concurrency: 1 },
  { event: 'app/update-asteroid-page' },
  async ({ event, step, logger }) => {
    const searchAfter = event.data?.searchAfter as number[] | undefined
    const updatedAsteroids = (event.data?.updatedAsteroids ?? 0) as number
    const runId = (event.data?.runId ?? 0) as number

    const start = new Date().getTime()

    const { asteroids: apiAsteroids, nextSearchAfter } = await getAsteroidPage(
      BATCH_SIZE,
      searchAfter
    )
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

    const durationMs = new Date().getTime() - start
    const totalUpdated = updatedAsteroids + existingAsteroids.size
    logger.info(
      `${totalUpdated} asteroids updated in DB. Step took ${durationMs}ms`
    )

    if (nextSearchAfter) {
      step.sendEvent('app/update-asteroid-page', {
        name: 'app/update-asteroid-page',
        data: {
          searchAfter: nextSearchAfter,
          updatedAsteroids: totalUpdated,
          runId,
        },
      })
    } else {
      const end = new Date()
      const run = await db.asteroidImportRun.update({
        where: {
          id: runId,
        },
        data: {
          end,
        },
      })
      const duration = (end.getTime() - run.start.getTime()) / 1000
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

  const ownerChanged =
    !!existingAsteroid.ownerAddress &&
    !!newOwner &&
    newOwner !== existingAsteroid.ownerAddress

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
