import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
} from 'nuqs/server'

export const asteroidDistancesParams = {
  origin: parseAsInteger,
  destinations: parseAsArrayOf(parseAsInteger),
  timeFormat: parseAsStringEnum(['adalian-days', 'real-days']).withDefault(
    'real-days'
  ),
  realDaysToShow: parseAsInteger.withDefault(180),
}

export const asteroidDistancesParamsCache = createSearchParamsCache(
  asteroidDistancesParams
)

export type AsteroidDistancesParams = ReturnType<
  typeof asteroidDistancesParamsCache.parse
>
export type TimeFormat = AsteroidDistancesParams['timeFormat']
