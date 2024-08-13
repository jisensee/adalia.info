import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

export const shipsForSaleParams = {
  asteroidId: parseAsInteger,
  shipType: parseAsInteger,
  shipVariant: parseAsInteger,
  seller: parseAsString,
}
export const shipsForSaleParamsCache =
  createSearchParamsCache(shipsForSaleParams)

export type Filters = ReturnType<typeof shipsForSaleParamsCache.parse>
