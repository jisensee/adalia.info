import {
  Asteroid,
  AsteroidBonusType,
  AsteroidRarity,
  AsteroidScanStatus,
  Blockchain,
} from '@prisma/client'
import {
  BonusType,
  Building,
  Rarity,
  Asteroid as SdkAsteroid,
} from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { A, D, N, pipe } from '@mobily/ts-belt'
import { inngest } from './client'
import { db } from '@/server/db'
import { influenceApi } from '@/lib/influence-api/api'
import { asteroidBuildings } from '@/actions/asteroids'

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

    const { totalCount } = await influenceApi.util.asteroidPage({ size: 1 })
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

    const { asteroids: apiAsteroids, nextSearchAfter } =
      await influenceApi.util.asteroidPage({
        size: API_BATCH_SIZE,
        searchAfter,
      })

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
      (event.data?.apiAsteroids as InfluenceEntity[] | undefined) ?? []
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
  apiAsteroids: InfluenceEntity[],
  existingAsteroids: Map<number, Asteroid>
) => {
  const buildings = await asteroidBuildings(apiAsteroids.map((a) => a.id))
  const updates = apiAsteroids.flatMap((apiAsteroid) => {
    const existingAsteroid = existingAsteroids.get(apiAsteroid.id)

    if (!existingAsteroid) {
      return []
    }
    return updateAsteroid(
      apiAsteroid,
      existingAsteroid,
      buildings[apiAsteroid.id] ?? {}
    )
  })

  return Promise.all(updates)
}

const updateAsteroid = (
  apiAsteroid: InfluenceEntity,
  existingAsteroid: Asteroid,
  buildings: Record<number, number>
) => {
  if (!apiAsteroid.Celestial || !apiAsteroid.Nft) {
    return
  }

  const newScanStatus = convertScanStatus(apiAsteroid.Celestial.scanStatus)
  const scanChanged = newScanStatus !== existingAsteroid.scanStatus
  const apiBonuses = getApiBonuses(apiAsteroid)
  const newRarity =
    newScanStatus !== AsteroidScanStatus.UNSCANNED
      ? convertRarity(SdkAsteroid.getRarity(apiBonuses))
      : null

  const wasLongRangeScanned =
    scanChanged && newScanStatus === AsteroidScanStatus.LONG_RANGE_SCAN

  const newChain = convertChain(apiAsteroid.Nft.chain ?? undefined)
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
      warehouses: buildings[Building.IDS.WAREHOUSE] ?? 0,
      tankFarms: buildings[Building.IDS.TANK_FARM] ?? 0,
      extractors: buildings[Building.IDS.EXTRACTOR] ?? 0,
      refineries: buildings[Building.IDS.REFINERY] ?? 0,
      bioreactors: buildings[Building.IDS.BIOREACTOR] ?? 0,
      factories: buildings[Building.IDS.FACTORY] ?? 0,
      shipyards: buildings[Building.IDS.SHIPYARD] ?? 0,
      marketplaces: buildings[Building.IDS.MARKETPLACE] ?? 0,
      spaceports: buildings[Building.IDS.SPACEPORT] ?? 0,
      habitats: buildings[Building.IDS.HABITAT] ?? 0,
      totalBuildings: pipe(buildings, D.values, A.reduce(0, N.add)),
    },
  })
}

export const getApiBonuses = ({ Celestial }: InfluenceEntity) =>
  Celestial
    ? SdkAsteroid.getBonuses(Celestial.bonuses, Celestial.celestialType).filter(
        (b) => b.level > 0
      )
    : []

export const convertScanStatus = (scanStatus: number) => {
  switch (scanStatus) {
    case 4:
      return AsteroidScanStatus.ORBITAL_SCAN
    case 2:
      return AsteroidScanStatus.LONG_RANGE_SCAN
    default:
      return AsteroidScanStatus.UNSCANNED
  }
}

export const convertBonusType = (t: BonusType) => {
  switch (t) {
    case 'yield':
      return AsteroidBonusType.YIELD
    case 'fissile':
      return AsteroidBonusType.FISSILE
    case 'metal':
      return AsteroidBonusType.METAL
    case 'organic':
      return AsteroidBonusType.ORGANIC
    case 'rareearth':
      return AsteroidBonusType.RARE_EARTH
    case 'volatile':
    default:
      return AsteroidBonusType.VOLATILE
  }
}

export const convertChain = (chain?: string) => {
  switch (chain) {
    case 'ETHEREUM':
      return Blockchain.ETHEREUM
    case 'STARKNET':
      return Blockchain.STARKNET
  }
}

export const convertRarity = (apiRarity: Rarity) => {
  switch (apiRarity) {
    case 'Common':
      return AsteroidRarity.COMMON
    case 'Uncommon':
      return AsteroidRarity.UNCOMMON
    case 'Rare':
      return AsteroidRarity.RARE
    case 'Superior':
      return AsteroidRarity.SUPERIOR
    case 'Exceptional':
      return AsteroidRarity.EXCEPTIONAL
    case 'Incomparable':
    default:
      return AsteroidRarity.INCOMPARABLE
  }
}
