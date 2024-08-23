import { AsteroidRarity } from '@prisma/client'

export const rarityColors = {
  [AsteroidRarity.COMMON]: 'var(--common)',
  [AsteroidRarity.UNCOMMON]: 'var(--uncommon)',
  [AsteroidRarity.RARE]: 'var(--rare)',
  [AsteroidRarity.SUPERIOR]: 'var(--superior)',
  [AsteroidRarity.EXCEPTIONAL]: 'var(--exceptional)',
  [AsteroidRarity.INCOMPARABLE]: 'var(--incomparable)',
}

export const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]
