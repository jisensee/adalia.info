import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

export const addressParams = {
  walletAddress: parseAsString,
}

export const settingsParams = {
  warehouses: parseAsArrayOf(parseAsInteger),
  processors: parseAsArrayOf(parseAsInteger),
  hideLowAmounts: parseAsBoolean.withDefault(false),
  hideWithoutProcesses: parseAsBoolean.withDefault(false),
  restrictToAsteroid: parseAsBoolean.withDefault(true),
}
