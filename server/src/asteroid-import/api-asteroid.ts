import { Asteroid, AsteroidSize, SpectralType } from '../types'
import {
  KeplerianOrbit,
  OrbitalElements,
  Size,
  SpectralType as ApiSpectralType,
  toSize,
  toSpectralType,
} from 'influence-utils'

export interface ApiAsteroid {
  name?: string
  baseName: string
  i: number
  orbital: OrbitalElements
  r: number
  spectralType: number
  owner?: string
  rawBonuses?: number
}

const convertSize = (apiSize: Size) => {
  switch (apiSize) {
    case Size.Small:
      return AsteroidSize.Small
    case Size.Medium:
      return AsteroidSize.Medium
    case Size.Large:
      return AsteroidSize.Large
    case Size.Huge:
      return AsteroidSize.Huge
  }
}

const convertSpectralType = (apiType: ApiSpectralType) => {
  switch (apiType) {
    case ApiSpectralType.C:
      return SpectralType.C
    case ApiSpectralType.Ci:
      return SpectralType.Ci
    case ApiSpectralType.Cis:
      return SpectralType.Cis
    case ApiSpectralType.Cm:
      return SpectralType.Cm
    case ApiSpectralType.Cms:
      return SpectralType.Cms
    case ApiSpectralType.Cs:
      return SpectralType.Cs
    case ApiSpectralType.Si:
      return SpectralType.Si
    case ApiSpectralType.Sm:
      return SpectralType.Sm
    case ApiSpectralType.S:
      return SpectralType.S
    case ApiSpectralType.M:
      return SpectralType.M
    case ApiSpectralType.I:
      return SpectralType.I
  }
}

const calcSurface = (radius: number) => {
  // Radius is in meter but surface area is in kilometer
  const radiusKm = radius / 1000
  return 4 * radiusKm * radiusKm * Math.PI
}

export const convertApiAsteroidToInternal = (
  apiAsteroid: ApiAsteroid
): Asteroid => {
  const orbit = new KeplerianOrbit(apiAsteroid.orbital)
  return {
    id: apiAsteroid.i,
    baseName: apiAsteroid.baseName,
    scanned: !!apiAsteroid.rawBonuses,
    name: apiAsteroid.name ?? apiAsteroid.baseName,
    owner: apiAsteroid.owner ?? null,
    spectralType: convertSpectralType(toSpectralType(apiAsteroid.spectralType)),
    radius: apiAsteroid.r,
    surfaceArea: calcSurface(apiAsteroid.r),
    size: convertSize(toSize(apiAsteroid.r)),
    eccentricity: apiAsteroid.orbital.e,
    inclination: apiAsteroid.orbital.i * (180 / Math.PI),
    semiMajorAxis: apiAsteroid.orbital.a,
    orbitalPeriod: orbit.getPeriod(),
  }
}