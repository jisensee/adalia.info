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
