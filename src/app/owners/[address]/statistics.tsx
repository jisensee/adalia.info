'use client'

import { AsteroidRarity, AsteroidScanStatus } from '@prisma/client'
import { Format } from '@/lib/format'
import { useAsteroidFilterNavigation } from '@/components/asteroid-filters/hooks'
import { Statistic } from '@/components/statistic'

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
