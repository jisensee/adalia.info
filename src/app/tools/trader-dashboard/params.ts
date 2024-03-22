import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

export const traderDashboardParams = {
  walletAddress: parseAsString,
}

export const beltProductionParams = {
  asteroidId: parseAsInteger,
  productSearch: parseAsString,
}

export const traderDashbboardParamsCache = createSearchParamsCache(
  traderDashboardParams
)

export const beltProductionParamsCache =
  createSearchParamsCache(beltProductionParams)
