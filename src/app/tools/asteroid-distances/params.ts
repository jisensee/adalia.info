import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
} from 'nuqs/server'

export type Trip = {
  origin: number
  destination: number
}

export const asteroidDistancesParams = {
  origin: parseAsInteger,
  destinations: parseAsArrayOf(parseAsInteger),
  realDaysToShow: parseAsInteger.withDefault(180),
  trips: parseAsArrayOf(parseAsJson<Trip>()).withDefault([]),
}

export const asteroidDistancesParamsCache = createSearchParamsCache(
  asteroidDistancesParams
)

export type AsteroidDistancesParams = ReturnType<
  typeof asteroidDistancesParamsCache.parse
>
