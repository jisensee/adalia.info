import { SortDirection } from '@tanstack/react-table'
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
} from 'next-usequerystate/parsers'
import { useQueryState, useQueryStates } from 'next-usequerystate'
import { TransitionStartFunction } from 'react'
import { AsteroidColumn } from './columns'

export type Sort = {
  id: AsteroidColumn
  direction: SortDirection
}

export type AsteroidColumnConfig = {
  id: AsteroidColumn
  active: boolean
}

export const defaultAsteroidColumnConfig: AsteroidColumnConfig[] = [
  { id: 'owner', active: true },
  { id: 'name', active: true },
  { id: 'scanStatus', active: true },
  { id: 'scanBonus', active: false },
  { id: 'earlyAdopter', active: false },
  { id: 'purchaseOrder', active: false },
  { id: 'spectralType', active: true },
  { id: 'size', active: true },
  { id: 'rarity', active: true },
  { id: 'surfaceArea', active: true },
  { id: 'radius', active: false },
  { id: 'orbitalPeriod', active: true },
  { id: 'inclination', active: false },
  { id: 'eccentricity', active: false },
  { id: 'semiMajorAxis', active: false },
  { id: 'blockchain', active: false },
]

const asteroidPageParamsParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(15),
  sort: parseAsJson<Sort>().withDefault({ id: 'id', direction: 'asc' }),
}
export const useAsteroidPageParams = (
  startTransition?: TransitionStartFunction
) =>
  useQueryStates(asteroidPageParamsParsers, {
    history: 'push',
    startTransition,
    shallow: false,
  })

export const asteroidPageParamsCache = createSearchParamsCache(
  asteroidPageParamsParsers
)

export const useAsteroidColumns = () =>
  useQueryState(
    'columns',
    parseAsArrayOf(parseAsJson<AsteroidColumnConfig>()).withDefault(
      defaultAsteroidColumnConfig
    )
  )
