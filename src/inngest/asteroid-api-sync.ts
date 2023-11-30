import { Asteroid, AsteroidScanStatus } from '@prisma/client'
import { Asteroid as SdkAsteroid } from '@influenceth/sdk'
import { GetEvents } from 'inngest'
import { Logger } from 'inngest/middleware/logger'
import {
  ApiAsteroid,
  convertBonusType,
  convertChain,
  convertRarity,
  convertScanStatus,
  getApiBonuses,
} from './types'
import {
  getAdaliaPrime,
  getAsteroids,
  getLastPurchaseOrder,
} from './influence-api'
import { inngest } from './client'
import { db } from '@/server/db'

const BATCH_SIZE = parseInt(
  process.env.ASTEROID_API_SYNC_BATCH_SIZE ?? '50',
  10
)

type Events = GetEvents<typeof inngest>

export const startAsteroidSync = inngest.createFunction(
  { id: 'start-asteroid-sync' },
  { event: 'app/start-asteroid-sync' },
  async ({ step, logger }) => {
    if (!process.env.INFLUENCE_API_ACCESS_TOKEN) {
      logger.warn('Skipping asteroid sync, no influence access token')
      return
    }
    const lastPurchaseOrder = await getLastPurchaseOrder()
    logger.info('Updating to purchase order', lastPurchaseOrder)
    await updateAdaliaPrime()

    const ranges = makeRanges(lastPurchaseOrder)

    const runId = (
      await db.asteroidImportRun.create({
        data: {
          start: new Date(),
          runningWorkers: ranges.length,
        },
      })
    ).id

    const events = ranges.map<Events['app/update-asteroid-range']>((range) => ({
      name: 'app/update-asteroid-range',
      data: {
        from: range[0],
        to: range[1],
        runId,
      },
    }))

    await step.sendEvent('app/update-asteroid-range', events)
  }
)

export const startScheduledAsteroidSync = inngest.createFunction(
  { id: 'start-scheduled-asteroid-sync' },
  { cron: '0 8,20 * * *' },
  async ({ step }) => {
    await step.sendEvent('app/start-asteroid-sync', [
      { name: 'app/start-asteroid-sync' },
    ])
  }
)

export const updateAsteroidRange = inngest.createFunction(
  { id: 'update-asteroid-range', concurrency: 10 },
  { event: 'app/update-asteroid-range' },
  async ({ event, logger }) => {
    const { from, to, runId } = event.data
    await updateRange([from, to], runId, logger)
  }
)

const updateRange = async (
  range: [number, number],
  runId: number,
  logger: Logger
) => {
  const start = new Date()
  const prefix = `[${range[0]}-${range[1]}]`

  logger.info(prefix, `Updating asteroid range`)
  const apiAsteroids = await getAsteroids(range[0], range[1])
  logger.info(prefix, `Got ${apiAsteroids.length} asteroids from API`)
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
  logger.info(prefix, `Got ${existingAsteroids.size} asteroids from DB`)
  await updateAsteroids(apiAsteroids, existingAsteroids)

  logger.info(prefix, 'Finish updating asteroids in DB')

  const run = await db.asteroidImportRun.update({
    where: { id: runId },
    data: {
      runningWorkers: {
        decrement: 1,
      },
    },
  })

  logger.info(`Updated range in ${new Date().getTime() - start.getTime()}ms`)

  if (run.runningWorkers === 0) {
    await db.asteroidImportRun.update({
      where: { id: runId },
      data: {
        end: new Date(),
      },
    })
    console.log(`Finished import run ${runId}`)
  }
}

const makeRanges = (lastPurchaseOrder: number) => {
  const ranges: [number, number][] = []
  let from = 1
  let to = BATCH_SIZE
  while (from < lastPurchaseOrder) {
    ranges.push([from, to])
    from = to + 1
    to = Math.min(from + BATCH_SIZE - 1, lastPurchaseOrder)
  }
  return ranges
}

const updateAdaliaPrime = async () => {
  const api = await getAdaliaPrime()
  const existing = await db.asteroid.findUnique({
    where: { id: 1 },
  })
  if (existing) {
    await updateAsteroid(api, existing)
  }
}

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
