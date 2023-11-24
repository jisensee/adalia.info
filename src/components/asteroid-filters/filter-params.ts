import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
  Blockchain,
} from '@prisma/client'
import {
  ArrayParam,
  BooleanParam,
  DecodedValueMap,
  QueryParamConfig,
  createEnumArrayParam,
  createEnumParam,
  decodeString,
} from 'serialize-query-params'

const RangeParam: QueryParamConfig<[number, number] | undefined | null> = {
  encode: (value) => value?.join('-'),
  decode: (value) => {
    const arr = decodeString(value)?.split('-')
    if (arr && arr.length === 2) {
      const [min, max] = arr.map(Number)
      if (min && max && !isNaN(min) && !isNaN(max)) {
        return [min, max]
      }
    }
    return undefined
  },
}

export const asteroidFilterParamsConfig = {
  owned: BooleanParam,
  owners: ArrayParam,
  earlyAdopter: BooleanParam,
  scanBonus: createEnumArrayParam(['1', '2', '3', '4']),
  blockchain: createEnumParam([Blockchain.ETHEREUM, Blockchain.STARKNET]),
  scanStatus: createEnumArrayParam([
    AsteroidScanStatus.UNSCANNED,
    AsteroidScanStatus.LONG_RANGE_SCAN,
    AsteroidScanStatus.ORBITAL_SCAN,
  ]),
  purchaseOrder: RangeParam,
  rarity: createEnumArrayParam([
    AsteroidRarity.COMMON,
    AsteroidRarity.UNCOMMON,
    AsteroidRarity.RARE,
    AsteroidRarity.SUPERIOR,
    AsteroidRarity.EXCEPTIONAL,
    AsteroidRarity.INCOMPARABLE,
  ]),
  spectralType: createEnumArrayParam([
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
  ]),
  size: createEnumArrayParam([
    AsteroidSize.SMALL,
    AsteroidSize.MEDIUM,
    AsteroidSize.LARGE,
    AsteroidSize.HUGE,
  ]),
  radius: RangeParam,
  surfaceArea: RangeParam,
  semiMajorAxis: RangeParam,
  inclination: RangeParam,
  orbitalPeriod: RangeParam,
  eccentricity: RangeParam,
}

export type AsteroidFilterParams = DecodedValueMap<
  typeof asteroidFilterParamsConfig
>
