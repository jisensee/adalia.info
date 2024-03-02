import { parseAsArrayOf, parseAsBoolean, parseAsJson } from 'nuqs/server'

export type WarehouseParam = {
  asteroidId: number
  lotId: number
}

export const warehousesParams = {
  warehouses: parseAsArrayOf(parseAsJson<WarehouseParam>()).withDefault([]),
}

export const settingsParams = {
  hideLowAmounts: parseAsBoolean.withDefault(false),
  hideWithoutProcesses: parseAsBoolean.withDefault(false),
}
