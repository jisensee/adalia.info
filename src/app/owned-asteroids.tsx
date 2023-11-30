import { Progress } from '@/components/ui/progress'
import { Constants } from '@/lib/constants'
import { db } from '@/server/db'

export const OwnedAsteroids = async () => {
  const ownedAsteroids = await db.asteroid.count({
    where: { ownerAddress: { not: null } },
  })
  const ownedPercentage = (ownedAsteroids / Constants.TOTAL_ASTEROIDS) * 100
  return (
    <div className='relative'>
      <div className='absolute top-[10%] z-50 flex w-full items-center justify-center text-primary-foreground'>
        Total Owned asteroids: {ownedAsteroids.toLocaleString()}
        <span className='hidden md:inline'>
          {' '}
          / {Constants.TOTAL_ASTEROIDS.toLocaleString()} (
          {ownedPercentage.toFixed(1)}%)
        </span>
      </div>
      <Progress className='h-8' value={ownedPercentage} />
    </div>
  )
}
