import { Readable } from 'stream'
import { Asteroid, Prisma } from '@prisma/client'
import { AsteroidsPageParams, Sort } from '@/app/asteroids/types'
import { db } from '@/server/db'
import { AsteroidRow } from '@/app/asteroids/columns'

const getSort = (field: keyof AsteroidRow, sorting?: Sort) =>
  sorting?.id === field ? sorting.direction : undefined

const makeFilter = <Value, Filter>(
  value: Value | undefined | null,
  filter: (value: Value) => Filter
) => (value !== undefined && value !== null ? filter(value) : undefined)

const makeRangeFilter = (range: [number, number] | undefined | null) =>
  makeFilter(range, ([min, max]) => ({
    gte: min,
    lte: max,
  }))

const makeRadiusFilter = (
  radius: [number, number] | undefined | null,
  surfaceArea: [number, number] | undefined | null
) => {
  if (radius) {
    return makeRangeFilter(radius)
  } else if (surfaceArea) {
    const [from, to] = surfaceArea
    return makeRangeFilter([
      Math.sqrt(from / (4 * Math.PI)),
      Math.sqrt(to / (4 * Math.PI)),
    ])
  }
}

const makeWhereFilter = (
  params: AsteroidsPageParams
): Prisma.AsteroidWhereInput => ({
  ownerAddress:
    makeFilter(params.owner, (owner) => ({ equals: owner })) ??
    makeFilter(params.owned, (owned) => (owned ? { not: null } : null)),
  radius: makeRadiusFilter(params.radius, params.surfaceArea),
  orbitalPeriod: makeRangeFilter(params.orbitalPeriod),
  semiMajorAxis: makeRangeFilter(params.semiMajorAxis),
  inclination: makeRangeFilter(params.inclination),
  eccentricity: makeRangeFilter(params.eccentricity),
  size: makeFilter(params.size, (size) => ({ in: size })),
  rarity: makeFilter(params.rarity, (rarity) => ({ in: rarity })),
  spectralType: makeFilter(params.spectralType, (spectralType) => ({
    in: spectralType,
  })),
  scanStatus: makeFilter(params.scanStatus, (scanStatus) => ({
    in: scanStatus,
  })),
})

const makeOrderBy = (
  params: AsteroidsPageParams
): Prisma.AsteroidOrderByWithRelationInput => ({
  id: getSort('id', params.sorting),
  name: getSort('name', params.sorting),
  radius:
    getSort('radius', params.sorting) ??
    getSort('size', params.sorting) ??
    getSort('surfaceArea', params.sorting),
  orbitalPeriod: getSort('orbitalPeriod', params.sorting),
  semiMajorAxis: getSort('semiMajorAxis', params.sorting),
  inclination: getSort('inclination', params.sorting),
  eccentricity: getSort('eccentricity', params.sorting),
})

const getPage = (
  page: number,
  pageSize: number,
  params: AsteroidsPageParams
): Promise<[number, Asteroid[]]> => {
  const filter = makeWhereFilter(params)

  return db.$transaction([
    db.asteroid.count({ where: filter }),
    db.asteroid.findMany({
      where: filter,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: makeOrderBy(params),
    }),
  ])
}

const getExport = (
  params: AsteroidsPageParams,
  transform: (asteroid: Asteroid) => string
) =>
  db.asteroid.cursorStream(
    {
      where: makeWhereFilter(params),
    },
    {
      batchSize: 5000,
      batchTransformer: (asteroids) =>
        Promise.resolve(asteroids.map(transform)),
    }
  ) as unknown as Readable

export const AsteroidService = {
  getPage,
  getExport,
}
