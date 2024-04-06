import { Readable } from 'stream'
import { Asteroid, AsteroidScanStatus, Prisma } from '@prisma/client'
import { Address } from '@influenceth/sdk'
import { Sort } from '@/app/asteroids/types'
import { db } from '@/server/db'
import { AsteroidColumn } from '@/app/asteroids/columns'
import { Constants } from '@/lib/constants'
import {
  AsteroidFilters,
  RangeParam,
} from '@/components/asteroid-filters/filter-params'
import {
  StarkSightTokenResponse,
  fetchStarkSightTokenData,
} from '@/lib/starksight'

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

const getStarkSightTokenData = (filters: AsteroidFilters) =>
  filters.starksightToken
    ? fetchStarkSightTokenData(filters.starksightToken.token)
    : undefined

const makeWhereFilter = async (
  filters: AsteroidFilters
): Promise<Prisma.AsteroidWhereInput> => {
  const starkSightIds = await getStarkSightTokenData(filters)?.then((d) =>
    d?.data.INFA.map(({ id }) => id)
  )

  return {
    id: makeFilter(starkSightIds, (ids) => ({ in: ids })),
    name: makeFilter(filters.name, (name) => ({
      search: sanitizeNameSearchTerm(name),
    })),
    ownerAddress:
      makeFilter(filters.owners, (owners) => ({
        in: owners
          .map((o) => Address.toStandard(o))
          .filter(Boolean) as string[],
      })) ??
      makeFilter(filters.owned, (owned) => (owned ? { not: null } : null)),
    radius: makeRangeFilter(filters.radius),
    surfaceArea: makeRangeFilter(filters.surfaceArea),
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
    salePrice: makeRangeFilter(filters.salePrice),
    scanStatus: makeFilter(filters.scanStatus, (scanStatus) => ({
      in: scanStatus,
    })),
    AND: makePurchaseOrderFilter(filters).map((filter) => ({
      purchaseOrder: filter,
    })),
  }
}

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
  rarity: getSort('rarity', sort),
  salePrice: getSort('salePrice', sort),
})

export type AsteroidWithCustomColumns = Asteroid & {
  starkSightUser?: string
  starkSightGroup?: string
}

export type AsteroidPage = {
  totalCount: number
  asteroids: AsteroidWithCustomColumns[]
  starkSightColumns?: StarkSightTokenResponse['columns']
}

const getPage = async (
  page: number,
  pageSize: number,
  filters: AsteroidFilters,
  sort: Sort
): Promise<AsteroidPage> => {
  const starkSightData = await getStarkSightTokenData(filters)
  const starkSightAsteroids = new Map(
    starkSightData?.data.INFA.map((a) => [a.id, a]) ?? []
  )

  const filter = await makeWhereFilter(filters)

  const [totalCount, asteroids] = await db.$transaction([
    db.asteroid.count({ where: filter }),
    db.asteroid.findMany({
      where: filter,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: makeOrderBy(sort),
    }),
  ])

  return {
    totalCount,
    asteroids: asteroids.map((a) => {
      const starkSightAsteroid = starkSightAsteroids.get(a.id)
      return {
        ...a,
        ...starkSightAsteroid,
      }
    }),
    starkSightColumns: starkSightData?.columns,
  }
}

const getExport = async (
  filters: AsteroidFilters,
  transform: (asteroid: Asteroid) => string
) =>
  db.asteroid.cursorStream(
    {
      where: await makeWhereFilter(filters),
    },
    {
      batchSize: 5000,
      batchTransformer: (asteroids) =>
        Promise.resolve(asteroids.map(transform)),
    }
  ) as unknown as Readable

const getGroupedByRarity = async (filters: AsteroidFilters) => {
  const where = await makeWhereFilter(filters)

  return db.$transaction([
    db.asteroid.count({ where }),
    db.asteroid.groupBy({
      where,
      by: ['rarity'],
      _count: true,
    }),
  ])
}

const getGroupedBySpectralType = async (filters: AsteroidFilters) => {
  const where = await makeWhereFilter(filters)

  return db.$transaction([
    db.asteroid.count({ where }),
    db.asteroid.groupBy({
      where,
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
  const where = await makeWhereFilter(filters)

  const matchedCountQuery = db.asteroid.count({ where })
  const matchedSurfaceAreaQuery = db.asteroid.aggregate({
    where,
    _sum: {
      surfaceArea: true,
    },
  })
  const ownedQuery = db.asteroid.count({
    where: where.ownerAddress
      ? where
      : { ...where, ownerAddress: { not: null } },
  })
  const scannedQuery = db.asteroid.count({
    where: {
      ...where,
      scanStatus: { not: AsteroidScanStatus.UNSCANNED },
    },
  })

  const [
    matchedCount,
    {
      _sum: { surfaceArea: matchedSurfaceArea },
    },
    owned,
    scanned,
  ] = await db.$transaction([
    matchedCountQuery,
    matchedSurfaceAreaQuery,
    ownedQuery,
    scannedQuery,
  ])

  return {
    matchedCount,
    matchedSurfaceArea: matchedSurfaceArea ?? 0,
    owned,
    scanned:
      filters.scanStatus?.length === 1 &&
      filters.scanStatus[0] === AsteroidScanStatus.UNSCANNED
        ? 0
        : scanned,
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
