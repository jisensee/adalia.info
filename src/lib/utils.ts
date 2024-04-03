import { AsteroidRarity } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
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

export const fixAddressForInfluenceApi = (address: string) => {
  if (address.length === 42 || address.length === 66) {
    return address.toLowerCase()
  }
  const missingZeroes = 66 - address.length
  return '0x' + '0'.repeat(missingZeroes) + address.slice(2).toLowerCase()
}
