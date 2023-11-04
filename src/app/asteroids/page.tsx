import { decodeQueryParams } from 'serialize-query-params'
import { Asteroid, Prisma } from '@prisma/client'
import { AsteroidTable } from './table'
import {
  AsteroidsPageParams,
  Sort,
  asteroidsPageParamConfig,
  defaultAsteroidColumnConfig,
} from './types'
import { Paginator } from './paginator'
import { ColumnConfig } from './column-config'
import { db } from '@/server/db'
import { AsteroidFilterForm } from '@/components/asteroid-filters/asteroid-filter-form'
import { AsteroidFilterSummary } from '@/components/asteroid-filters/filter-summary'

export default async function Asteroids({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const params = decodeQueryParams(asteroidsPageParamConfig, searchParams)
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10

  const [totalCount, asteroids] = await getData(page, pageSize, params)
  const totalPages = Math.ceil(totalCount / pageSize)

  const tableHeader = (
    <div className='flex flex-row items-center justify-between'>
      <h2>{totalCount.toLocaleString()} Asteroids</h2>
      <div className='flex flex-row gap-x-2'>
        <ColumnConfig params={params} />
      </div>
    </div>
  )

  return (
    <div className='flex h-full flex-row gap-x-2 overflow-y-hidden'>
      <AsteroidFilterForm searchParams={searchParams} />
      <div className='flex w-full flex-grow flex-col gap-y-2 overflow-y-auto p-3'>
        <h1>Asteroids</h1>
        <p>
          Select your filters in the sidebar and copy the URL to share your
          current filter and sorting setup.
        </p>
        <AsteroidFilterSummary searchParams={searchParams} />
        {tableHeader}
        <AsteroidTable
          columns={params.columns ?? defaultAsteroidColumnConfig}
          data={asteroids}
          pageParams={params}
        />
        <Paginator params={params} totalPages={totalPages} />
      </div>
    </div>
  )
}

const getSort = (field: keyof Asteroid, sorting?: Sort) =>
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

const getData = (
  page: number,
  pageSize: number,
  params: AsteroidsPageParams
): Promise<[number, Asteroid[]]> => {
  const filter: Prisma.AsteroidWhereInput = {
    ownerAddress:
      makeFilter(params.owner, (owner) => ({ equals: owner })) ??
      makeFilter(params.owned, (owned) => (owned ? { not: null } : null)),
    radius: makeRangeFilter(params.radius),
    surfaceArea: makeRangeFilter(params.surfaceArea),
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
  }

  return db.$transaction([
    db.asteroid.count({ where: filter }),
    db.asteroid.findMany({
      where: filter,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        id: getSort('id', params.sorting),
        name: getSort('name', params.sorting),
        ownerAddress: getSort('ownerAddress', params.sorting),
        radius:
          getSort('radius', params.sorting) ?? getSort('size', params.sorting),
        surfaceArea: getSort('surfaceArea', params.sorting),
        orbitalPeriod: getSort('orbitalPeriod', params.sorting),
        semiMajorAxis: getSort('semiMajorAxis', params.sorting),
        inclination: getSort('inclination', params.sorting),
        eccentricity: getSort('eccentricity', params.sorting),
      },
    }),
  ])
}
