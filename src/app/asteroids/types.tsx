import { Asteroid } from '@prisma/client'
import { SortDirection } from '@tanstack/react-table'
import { Route } from 'next'
import {
  NumberParam,
  DecodedValueMap,
  objectToSearchString,
  encodeQueryParams,
  decodeString,
  QueryParamConfig,
  ArrayParam,
  withDefault,
} from 'serialize-query-params'
import { AsteroidColumn } from './columns'
import { asteroidFilterParamsConfig } from '@/components/asteroid-filters/filter-params'

export type Sort = {
  id: keyof Asteroid
  direction: SortDirection
}

const SortParam: QueryParamConfig<Sort | undefined> = {
  encode: (value) => value && `${value.id}:${value.direction}`,
  decode: (value) => {
    const [id, direction] = decodeString(value)?.split(':') ?? []
    return id && direction
      ? { id: id as keyof Asteroid, direction: direction as SortDirection }
      : undefined
  },
}

export const defaultAsteroidColumns: AsteroidColumn[] = [
  'id',
  'name',
  'ownerAddress',
  'spectralType',
  'size',
  'surfaceArea',
  'rarity',
  'orbitalPeriod',
]

export const asteroidsPageParamConfig = {
  page: NumberParam,
  pageSize: NumberParam,
  sorting: SortParam,
  columns: withDefault(ArrayParam, defaultAsteroidColumns),
  ...asteroidFilterParamsConfig,
}

export type AsteroidsPageParams = Partial<
  DecodedValueMap<typeof asteroidsPageParamConfig>
>

export const buildAsteroidsUrl = (params: AsteroidsPageParams) =>
  ('/asteroids?' +
    objectToSearchString(
      encodeQueryParams(asteroidsPageParamConfig, params)
    )) as Route
