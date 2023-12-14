import { AsteroidRarity } from '@prisma/client'

export const rarityColors = {
  [AsteroidRarity.COMMON]: '#ffffff',
  [AsteroidRarity.UNCOMMON]: '#65e4f5',
  [AsteroidRarity.RARE]: '#5da0f4',
  [AsteroidRarity.SUPERIOR]: '#944cde',
  [AsteroidRarity.EXCEPTIONAL]: '#e3853a',
  [AsteroidRarity.INCOMPARABLE]: '#c7a519',
}
