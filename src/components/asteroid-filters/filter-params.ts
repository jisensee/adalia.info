import { parseAsJson } from 'nuqs'
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs/parsers'
import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
  Blockchain,
} from '@prisma/client'

export type RangeParam = { from: number; to: number }

export const asteroidFilterParamsParsers = {
  name: parseAsString,
  owned: parseAsBoolean,
  owners: parseAsArrayOf(parseAsString),
  earlyAdopter: parseAsBoolean,
  scanBonus: parseAsArrayOf(parseAsStringEnum(['1', '2', '3', '4'])),
  blockchain: parseAsStringEnum([Blockchain.ETHEREUM, Blockchain.STARKNET]),
  scanStatus: parseAsArrayOf(
    parseAsStringEnum([
      AsteroidScanStatus.UNSCANNED,
      AsteroidScanStatus.LONG_RANGE_SCAN,
      AsteroidScanStatus.ORBITAL_SCAN,
    ])
  ),
  purchaseOrder: parseAsJson<RangeParam>(),
  rarity: parseAsArrayOf(
    parseAsStringEnum([
      AsteroidRarity.COMMON,
      AsteroidRarity.UNCOMMON,
      AsteroidRarity.RARE,
      AsteroidRarity.SUPERIOR,
      AsteroidRarity.EXCEPTIONAL,
      AsteroidRarity.INCOMPARABLE,
    ])
  ),
  spectralType: parseAsArrayOf(
    parseAsStringEnum([
      AsteroidSpectralType.C,
      AsteroidSpectralType.CI,
      AsteroidSpectralType.CIS,
      AsteroidSpectralType.CM,
      AsteroidSpectralType.CMS,
      AsteroidSpectralType.CS,
      AsteroidSpectralType.I,
      AsteroidSpectralType.M,
      AsteroidSpectralType.S,
      AsteroidSpectralType.SI,
      AsteroidSpectralType.SM,
    ])
  ),
  size: parseAsArrayOf(
    parseAsStringEnum([
      AsteroidSize.SMALL,
      AsteroidSize.MEDIUM,
      AsteroidSize.LARGE,
      AsteroidSize.HUGE,
    ])
  ),
  radius: parseAsJson<RangeParam>(),
  surfaceArea: parseAsJson<RangeParam>(),
  semiMajorAxis: parseAsJson<RangeParam>(),
  inclination: parseAsJson<RangeParam>(),
  orbitalPeriod: parseAsJson<RangeParam>(),
  eccentricity: parseAsJson<RangeParam>(),
}

export const asteroidFiltersCache = createSearchParamsCache(
  asteroidFilterParamsParsers
)

export type AsteroidFilters = ReturnType<typeof asteroidFiltersCache.parse>

export const emptyAsteroidFilters: AsteroidFilters = {
  name: null,
  spectralType: null,
  rarity: null,
  scanStatus: null,
  owned: null,
  owners: null,
  blockchain: null,
  earlyAdopter: null,
  scanBonus: null,
  purchaseOrder: null,
  radius: null,
  surfaceArea: null,
  size: null,
  semiMajorAxis: null,
  inclination: null,
  eccentricity: null,
  orbitalPeriod: null,
}
