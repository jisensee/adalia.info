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
export type AsteroidColumnConfig = {
  id: AsteroidColumn
  active: boolean
}
const ColumnConfigParam: QueryParamConfig<AsteroidColumnConfig[] | undefined> =
  {
    encode: (value) => value?.map((c) => `${c.id}:${c.active}`).join(','),
    decode: (value) => {
      const str = decodeString(value)
      if (!str) {
        return undefined
      }
      return str.split(',').map((s) => {
        const [id, active] = s.split(':')
        return {
          id: id as AsteroidColumn,
          active: active === 'true',
        }
      })
    },
  }

export const defaultAsteroidColumnConfig: AsteroidColumnConfig[] = [
  { id: 'owner', active: true },
  { id: 'name', active: true },
  { id: 'scanStatus', active: true },
  { id: 'spectralType', active: true },
  { id: 'size', active: true },
  { id: 'rarity', active: true },
  { id: 'surfaceArea', active: true },
  { id: 'radius', active: false },
  { id: 'orbitalPeriod', active: true },
  { id: 'inclination', active: false },
  { id: 'eccentricity', active: false },
  { id: 'semiMajorAxis', active: false },
]

export const asteroidsPageParamConfig = {
  page: NumberParam,
  pageSize: NumberParam,
  sorting: SortParam,
  columns: ColumnConfigParam,
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
