import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import { Constants } from './constants'

const numberFormatter =
  (maxDecimals: number, unit?: string) => (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    }) + (unit ? ' ' + unit : '')

export const Format = {
  radius: numberFormatter(0, Constants.RADIUS_UNIT),
  surfaceArea: numberFormatter(0, Constants.SURFACE_AREA_UNIT),
  orbitalPeriod: numberFormatter(0, Constants.ORBITAL_PERIOD_UNIT),
  inclination: numberFormatter(2, Constants.INCLINATION_UNIT),
  semiMajorAxis: numberFormatter(2, Constants.SEMI_MAJOR_AXIS_UNIT),
  eccentricity: numberFormatter(2),
  ethAddress: (address: string, shownCharacters: number) => {
    const start = address.slice(0, shownCharacters + 2)
    const end = address.slice(-shownCharacters)
    return `${start}...${end}`
  },
  asteroidSize: (size: AsteroidSize) =>
    size[0]?.toUpperCase() + size.toLowerCase().slice(1),
  asteroidRarity: (rarity: AsteroidRarity) =>
    rarity[0]?.toUpperCase() + rarity.toLowerCase().slice(1),
  asteroidSpectralType: (type: AsteroidSpectralType) => type.toString(),
  asteroidScanStatus: (status: AsteroidScanStatus) => {
    switch (status) {
      case AsteroidScanStatus.UNSCANNED:
        return 'Unscanned'
      case AsteroidScanStatus.LONG_RANGE_SCAN:
        return 'Long range scan'
      case AsteroidScanStatus.RESOURCE_SCAN:
        return 'Resource scan'
    }
  },
}
