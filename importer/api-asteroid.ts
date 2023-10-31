import {
  Asteroid,
  AsteroidBonus,
  AsteroidBonusType,
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import {
  BonusType,
  KeplerianOrbit,
  OrbitalElements,
  Rarity,
  toBonuses,
  toRarity,
  toSize,
  toSpectralType,
} from 'influence-utils'

export interface ApiAsteroid {
  name?: string
  i: number
  orbital: OrbitalElements
  bonuses: number
  scanStatus: number
  r: number
  spectralType: number
  owner?: string
}

const calcSurface = (radius: number) => {
  // Radius is in meter but surface area is in kilometer
  const radiusKm = radius / 1000
  return 4 * radiusKm * radiusKm * Math.PI
}

const convertScanStatus = (scanStatus: number) => {
  switch (scanStatus) {
    case 1:
      return AsteroidScanStatus.LONG_RANGE_SCAN
    case 2:
      return AsteroidScanStatus.RESOURCE_SCAN
    default:
      return AsteroidScanStatus.UNSCANNED
  }
}

const convertSpectralType = (spectralType: number) => {
  switch (toSpectralType(spectralType)) {
    case 'C':
      return AsteroidSpectralType.C
    case 'S':
      return AsteroidSpectralType.S
    case 'M':
      return AsteroidSpectralType.M
    case 'I':
      return AsteroidSpectralType.I
    case 'Si':
      return AsteroidSpectralType.SI
    case 'Sm':
      return AsteroidSpectralType.SM
    case 'Cs':
      return AsteroidSpectralType.CS
    case 'Ci':
      return AsteroidSpectralType.CI
    case 'Cm':
      return AsteroidSpectralType.CM
    case 'Cms':
      return AsteroidSpectralType.CMS
    case 'Cis':
    default:
      return AsteroidSpectralType.CIS
  }
}

const getSize = (radius: number) => {
  switch (toSize(radius)) {
    case 'Small':
      return AsteroidSize.SMALL
    case 'Medium':
      return AsteroidSize.MEDIUM
    case 'Large':
      return AsteroidSize.LARGE
    case 'Huge':
    default:
      return AsteroidSize.HUGE
  }
}

const convertRarity = (apiRarity: Rarity) => {
  switch (apiRarity) {
    case 'Common':
      return AsteroidRarity.COMMON
    case 'Uncommon':
      return AsteroidRarity.UNCOMMON
    case 'Rare':
      return AsteroidRarity.RARE
    case 'Superior':
      return AsteroidRarity.SUPERIOR
    case 'Exceptional':
      return AsteroidRarity.EXCEPTIONAL
    case 'Incomparable':
    default:
      return AsteroidRarity.INCOMPARABLE
  }
}

const convertBonusType = (t: BonusType) => {
  switch (t) {
    case 'yield':
      return AsteroidBonusType.YIELD
    case 'fissile':
      return AsteroidBonusType.FISSILE
    case 'metal':
      return AsteroidBonusType.METAL
    case 'organic':
      return AsteroidBonusType.ORGANIC
    case 'rareearth':
      return AsteroidBonusType.RARE_EARTH
    case 'volatile':
    default:
      return AsteroidBonusType.VOLATILE
  }
}

const getApiBonuses = (asteroid: ApiAsteroid) =>
  asteroid.bonuses
    ? toBonuses(asteroid.bonuses, asteroid.spectralType).filter(
        (b) => b.level > 0
      )
    : []

export const convertApiAsteroid = (
  apiAsteroid: ApiAsteroid
): [Asteroid, Omit<AsteroidBonus, 'id'>[]] => {
  const orbit = new KeplerianOrbit(apiAsteroid.orbital)
  const bonuses = getApiBonuses(apiAsteroid)

  return [
    {
      id: apiAsteroid.i,
      name: apiAsteroid.name ?? '',
      ownerAddress: apiAsteroid.owner ?? null,
      radius: apiAsteroid.r,
      surfaceArea: calcSurface(apiAsteroid.r),
      orbitalPeriod: orbit.getPeriod(),
      eccentricity: apiAsteroid.orbital.e,
      inclination: apiAsteroid.orbital.i * (180 / Math.PI),
      semiMajorAxis: apiAsteroid.orbital.a,
      scanStatus: convertScanStatus(apiAsteroid.scanStatus),
      spectralType: convertSpectralType(apiAsteroid.spectralType),
      size: getSize(apiAsteroid.r),
      rarity: bonuses ? convertRarity(toRarity(bonuses)) : null,
    },
    bonuses.map((b) => ({
      type: convertBonusType(b.type),
      level: b.level,
      modifier: b.modifier,
      asteroidId: apiAsteroid.i,
    })),
  ]
}
