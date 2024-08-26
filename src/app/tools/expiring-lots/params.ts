import { parseAsBoolean, parseAsInteger, parseAsString } from 'nuqs'
import { createSearchParamsCache } from 'nuqs/server'

export const expiringLotsParams = {
  asteroidId: parseAsInteger.withDefault(1),
  deduplicateOwners: parseAsBoolean,
  owner: parseAsString,
  buildingType: parseAsInteger,
}

export const expiringLotswParamsCache =
  createSearchParamsCache(expiringLotsParams)

export type ExpiringLotsParams = ReturnType<
  typeof expiringLotswParamsCache.parse
>
