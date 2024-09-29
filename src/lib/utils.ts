import { AdalianOrbit, Time } from '@influenceth/sdk'
import { AsteroidRarity } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const rarityToScore = (rarity: AsteroidRarity) => {
  switch (rarity) {
    case AsteroidRarity.COMMON:
      return 0
    case AsteroidRarity.UNCOMMON:
      return 1
    case AsteroidRarity.RARE:
      return 2
    case AsteroidRarity.SUPERIOR:
      return 3
    case AsteroidRarity.EXCEPTIONAL:
      return 4
    case AsteroidRarity.INCOMPARABLE:
      return 5
  }
}

export const groupArrayBy = <T, K>(
  arr: T[],
  selector: (item: T) => K
): Map<K, T[]> => {
  const map = new Map<K, T[]>()
  arr.forEach((item) => {
    const key = selector(item)
    const group = map.get(key) ?? []
    group.push(item)
    map.set(key, group)
  })
  return map
}

export const getAsteroidDistance = (
  asteroid1: InfluenceEntity,
  asteroid2: InfluenceEntity,
  time: Time
) => {
  if (!asteroid1.Orbit || !asteroid2.Orbit) return 0

  const pos1 = new AdalianOrbit(asteroid1.Orbit, {
    units: 'km',
  }).getPositionAtTime(time.toOrbitADays())
  const pos2 = new AdalianOrbit(asteroid2.Orbit, {
    units: 'km',
  }).getPositionAtTime(time.toOrbitADays())
  const AU = 1.495978707e11
  return Math.hypot(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z) / AU
}

export const pluralize = (
  number: number,
  singular: string,
  plural?: string
) => {
  if (number === 1) {
    return singular
  }
  return plural ?? `${singular}s`
}
