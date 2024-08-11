import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
} from 'nuqs/server'

export const publicBuildingsParams = {
  asteroidId: parseAsInteger,
  buildingType: parseAsInteger,
  showBusyBuildings: parseAsBoolean.withDefault(true),
  habitatLotIndex: parseAsInteger,
}
export const publicBuildingsParamsCache = createSearchParamsCache(
  publicBuildingsParams
)
