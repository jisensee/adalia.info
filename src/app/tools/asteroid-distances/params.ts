import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
} from 'nuqs/server'

export const asteroidDistancesParams = {
  origin: parseAsInteger,
  destinations: parseAsArrayOf(parseAsInteger),
  realDaysToShow: parseAsInteger.withDefault(180),
}

export const asteroidDistancesParamsCache = createSearchParamsCache(
  asteroidDistancesParams
)

export type AsteroidDistancesParams = ReturnType<
  typeof asteroidDistancesParamsCache.parse
>
