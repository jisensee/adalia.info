import { Readable } from 'stream'
import { Asteroid, AsteroidScanStatus, Prisma } from '@prisma/client'
import { Sort } from '@/app/asteroids/types'
import { db } from '@/server/db'
import { AsteroidColumn } from '@/app/asteroids/columns'
import { Constants } from '@/lib/constants'
import {
  AsteroidFilters,
  RangeParam,
} from '@/components/asteroid-filters/filter-params'

const getSort = (field: AsteroidColumn, sort: Sort) =>
  sort.id === field ? sort.direction : undefined

const makeFilter = <Value, Filter>(
  value: Value | undefined | null,
  filter: (value: Value) => Filter
) => (value !== undefined && value !== null ? filter(value) : undefined)

const makeRangeFilter = (range: RangeParam | undefined | null) =>
  makeFilter(range, ({ from, to }) => ({
    gte: from,
    lte: to,
  }))

const makeRadiusFilter = (
  radius: RangeParam | undefined | null,
  surfaceArea: RangeParam | undefined | null
) => {
  if (radius) {
    return makeRangeFilter(radius)
  } else if (surfaceArea) {
    const { from, to } = surfaceArea
    return makeRangeFilter({
      from: Math.sqrt(from / (4 * Math.PI)),
      to: Math.sqrt(to / (4 * Math.PI)),
    })
  }
}

const earlyAdopterFilter = (earlyAdopter: boolean | undefined | null) => {
  if (earlyAdopter === undefined || earlyAdopter === null) {
    return undefined
  }

  if (earlyAdopter) {
    return makeRangeFilter({
      from: 0,
      to: Constants.EARLY_ADOPTER_PURCHASE_ORDER,
    })
  }
  return makeRangeFilter({
    from: Constants.EARLY_ADOPTER_PURCHASE_ORDER + 1,
    to: 250_000,
  })
}

const makePurchaseOrderFilter = (filters: AsteroidFilters) => {
  const earlyAdopter = earlyAdopterFilter(filters.earlyAdopter)

  const scanBonuses =
    filters.scanBonus?.map(parseInt)?.map((bonus) => {
      if (bonus === 2) {
        return makeRangeFilter({ from: 1001, to: 11_100 })
      }
      if (bonus === 3) {
        return makeRangeFilter({ from: 101, to: 1_100 })
      }
      if (bonus === 4) {
        return makeRangeFilter({ from: 0, to: 100 })
      }
      return makeRangeFilter({ from: 11_101, to: 250_000 })
    }) ?? []

  const direct = makeRangeFilter(filters.purchaseOrder)

  const result = []
  if (direct) {
    result.push(direct)
  }
  if (earlyAdopter) {
    result.push(earlyAdopter)
  }
  scanBonuses.forEach((bonus) => {
    if (bonus) {
      result.push(bonus)
    }
  })
  return result
}

const sanitizeNameSearchTerm = (searchTerm: string) =>
  searchTerm.trim().split(' ').join(' & ')

const makeWhereFilter = (
  filters: AsteroidFilters
): Prisma.AsteroidWhereInput => ({
  name: makeFilter(filters.name, (name) => ({
    search: sanitizeNameSearchTerm(name),
  })),
  ownerAddress:
    makeFilter(filters.owners, (owners) => ({
      in: owners.map((o) => o?.toLowerCase()).filter(Boolean) as string[],
    })) ?? makeFilter(filters.owned, (owned) => (owned ? { not: null } : null)),
  radius: makeRadiusFilter(filters.radius, filters.surfaceArea),
  orbitalPeriod: makeRangeFilter(filters.orbitalPeriod),
  semiMajorAxis: makeRangeFilter(filters.semiMajorAxis),
  inclination: makeRangeFilter(filters.inclination),
  eccentricity: makeRangeFilter(filters.eccentricity),
  size: makeFilter(filters.size, (size) => ({ in: size })),
  rarity: makeFilter(filters.rarity, (rarity) => ({ in: rarity })),
  spectralType: makeFilter(filters.spectralType, (spectralType) => ({
    in: spectralType,
  })),
  blockchain: filters.blockchain ?? undefined,
  scanStatus: makeFilter(filters.scanStatus, (scanStatus) => ({
    in: scanStatus,
  })),
  AND: makePurchaseOrderFilter(filters).map((filter) => ({
    purchaseOrder: filter,
  })),
})

const makeOrderBy = (sort: Sort) => ({
  id: getSort('id', sort),
  name: getSort('name', sort),
  radius:
    getSort('radius', sort) ??
    getSort('size', sort) ??
    getSort('surfaceArea', sort),
  orbitalPeriod: getSort('orbitalPeriod', sort),
  semiMajorAxis: getSort('semiMajorAxis', sort),
  inclination: getSort('inclination', sort),
  eccentricity: getSort('eccentricity', sort),
})

const getPage = (
  page: number,
  pageSize: number,
  filters: AsteroidFilters,
  sort: Sort
): Promise<[number, Asteroid[]]> => {
  const filter = makeWhereFilter(filters)

  return db.$transaction([
    db.asteroid.count({ where: filter }),
    db.asteroid.findMany({
      where: filter,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: makeOrderBy(sort),
    }),
  ])
}

const getExport = (
  filters: AsteroidFilters,
  transform: (asteroid: Asteroid) => string
) =>
  db.asteroid.cursorStream(
    {
      where: makeWhereFilter(filters),
    },
    {
      batchSize: 5000,
      batchTransformer: (asteroids) =>
        Promise.resolve(asteroids.map(transform)),
    }
  ) as unknown as Readable

const getGroupedByRarity = (filters: AsteroidFilters) => {
  const where = makeWhereFilter(filters)

  return db.$transaction([
    db.asteroid.count({ where }),
    db.asteroid.groupBy({
      where: makeWhereFilter(filters),
      by: ['rarity'],
      _count: true,
    }),
  ])
}

const getGroupedBySpectralType = (filters: AsteroidFilters) => {
  const where = makeWhereFilter(filters)

  return db.$transaction([
    db.asteroid.count({ where }),
    db.asteroid.groupBy({
      where: makeWhereFilter(filters),
      by: ['spectralType'],
      _count: true,
    }),
  ])
}

const search = (searchTerm: string) => {
  const id = parseInt(searchTerm, 10)
  return db.asteroid.findMany({
    take: 5,
    where: {
      OR: [
        {
          id: isNaN(id) ? undefined : id,
        },
        {
          name: { search: searchTerm.trim().split(' ').join(' & ') },
        },
      ],
    },
  })
}

const getProgressStats = async (filters: AsteroidFilters) => {
  const where = makeWhereFilter(filters)

  const matchedCount = await db.asteroid.count({ where })

  const owned = await db.asteroid.count({
    where: where.ownerAddress
      ? where
      : { ...where, ownerAddress: { not: null } },
  })
  const scanned =
    filters.scanStatus?.length === 1 &&
    filters.scanStatus[0] === AsteroidScanStatus.UNSCANNED
      ? 0
      : await db.asteroid.count({
          where: {
            scanStatus: { not: AsteroidScanStatus.UNSCANNED },
            ...where,
          },
        })

  return {
    matchedCount,
    owned,
    scanned,
  }
}

export const AsteroidService = {
  getPage,
  getExport,
  getGroupedByRarity,
  getGroupedBySpectralType,
  search,
  getProgressStats,
}
