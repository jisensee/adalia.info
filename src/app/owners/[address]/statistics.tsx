'use client'

import { ReactNode } from 'react'
import { AsteroidRarity, AsteroidScanStatus } from '@prisma/client'
import { cn } from '@/lib/utils'
import { Format } from '@/lib/format'
import { useAsteroidFilterNavigation } from '@/components/asteroid-filters/hooks'

export type StatisticsProps = {
  ownedCount: number
  scannedCount: number
  totalSurfaceArea: number
  highestRarity?: AsteroidRarity
  address: string
}

export const Statistics = ({
  ownedCount,
  scannedCount,
  totalSurfaceArea,
  highestRarity,
  address,
}: StatisticsProps) => {
  const navigate = useAsteroidFilterNavigation()

  return (
    <div className='flex flex-wrap gap-3'>
      <Statistic
        title='Owned asteroids'
        value={ownedCount}
        onClick={() => navigate({ owners: [address] })}
      />
      <Statistic
        title='Scanned asteroids'
        value={`${scannedCount} (${Format.percentage(
          scannedCount / ownedCount
        )})`}
        onClick={() =>
          navigate({
            scanStatus: [
              AsteroidScanStatus.ORBITAL_SCAN,
              AsteroidScanStatus.LONG_RANGE_SCAN,
            ],
            owners: [address],
          })
        }
      />
      <Statistic
        title='Controlled surface area'
        value={Format.surfaceArea(totalSurfaceArea)}
      />
      {highestRarity && (
        <Statistic
          title='Best rarity'
          value={Format.asteroidRarity(highestRarity)}
          valueClassName={Format.asteroidRarityClassName(highestRarity)}
          onClick={() =>
            navigate({ rarity: [highestRarity], owners: [address] })
          }
        />
      )}
    </div>
  )
}

type StatisticProps = {
  title: ReactNode
  value: ReactNode
  valueClassName?: string
  onClick?: () => void
}
const Statistic = ({
  title,
  value,
  valueClassName,
  onClick,
}: StatisticProps) => (
  <div
    className={cn('group rounded-md border border-primary p-3', {
      'cursor-pointer hover:bg-primary hover:text-primary-foreground': onClick,
    })}
    onClick={onClick}
  >
    <p
      className={cn(
        'text-center text-2xl font-bold text-primary',
        valueClassName,
        { 'group-hover:text-primary-foreground': onClick }
      )}
    >
      {value}
    </p>
    <p className='text-center text-sm font-semibold'>{title}</p>
  </div>
)
