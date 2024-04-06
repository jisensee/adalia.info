import { AdalianOrbit, Asteroid, OrbitalElements } from '@influenceth/sdk'
import {
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
  Prisma,
} from '@prisma/client'
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

export const convertSnapshotAsteroid = (
  snapshotAsteroid: SnapshotAsteroid
): Prisma.AsteroidCreateManyInput => {
  const orbit = new AdalianOrbit(snapshotAsteroid.orbital)
  const radius = snapshotAsteroid.r
  const surfaceArea = 4 * Math.PI * (radius / 1000) ** 2

  return {
    id: snapshotAsteroid.i,
    radius: snapshotAsteroid.r,
    surfaceArea,
    salePrice: calculatePrice(surfaceArea),
    orbitalPeriod: orbit.getPeriod(),
    eccentricity: snapshotAsteroid.orbital.e,
    inclination: snapshotAsteroid.orbital.i * (180 / Math.PI),
    semiMajorAxis: snapshotAsteroid.orbital.a,
    spectralType: convertSpectralType(snapshotAsteroid.spectralType),
    size: getSize(snapshotAsteroid.r),
    scanStatus: convertScanStatus(snapshotAsteroid.scanStatus),
    purchaseOrder:
      snapshotAsteroid.purchaseOrder > 0
        ? snapshotAsteroid.purchaseOrder
        : undefined,
  }
}

const convertSpectralType = (spectralType: number) => {
  switch (Asteroid.getSpectralType(spectralType)) {
    case 'C':
      return AsteroidSpectralType.C
    case 'S':
      return AsteroidSpectralType.S
    case 'M':
      return AsteroidSpectralType.M
    case 'I':
      return AsteroidSpectralType.I
    case 'Si':
      return AsteroidSpectralType.SI
    case 'Sm':
      return AsteroidSpectralType.SM
    case 'Cs':
      return AsteroidSpectralType.CS
    case 'Ci':
      return AsteroidSpectralType.CI
    case 'Cm':
      return AsteroidSpectralType.CM
    case 'Cms':
      return AsteroidSpectralType.CMS
    case 'Cis':
    default:
      return AsteroidSpectralType.CIS
  }
}

const getSize = (radius: number) => {
  switch (Asteroid.getSize(radius)) {
    case 'Small':
      return AsteroidSize.SMALL
    case 'Medium':
      return AsteroidSize.MEDIUM
    case 'Large':
      return AsteroidSize.LARGE
    case 'Huge':
    default:
      return AsteroidSize.HUGE
  }
}

export const convertScanStatus = (scanStatus: number) => {
  switch (scanStatus) {
    case 1:
      return AsteroidScanStatus.ORBITAL_SCAN
    case 2:
      return AsteroidScanStatus.LONG_RANGE_SCAN
    default:
      return AsteroidScanStatus.UNSCANNED
  }
}

export const calculatePrice = (surfaceArea: number) => {
  const basePrice = 0.0299
  const lotPrice = 0.00092

  return basePrice + surfaceArea * lotPrice
}

export interface SnapshotAsteroid {
  i: number
  orbital: OrbitalElements
  r: number
  spectralType: number
  scanStatus: number
  purchaseOrder: number
}
