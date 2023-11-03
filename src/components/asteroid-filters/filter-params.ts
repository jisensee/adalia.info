import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import {
  BooleanParam,
  DecodedValueMap,
  QueryParamConfig,
  StringParam,
  createEnumArrayParam,
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
  owner: StringParam,
  scanStatus: createEnumArrayParam([
    AsteroidScanStatus.UNSCANNED,
    AsteroidScanStatus.LONG_RANGE_SCAN,
    AsteroidScanStatus.RESOURCE_SCAN,
  ]),
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
