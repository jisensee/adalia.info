import { AsteroidScanStatus } from '@prisma/client'
import { db } from '@/server/db'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AsteroidImage } from '@/components/asteroid-image'

export const LastScannedAsteroids = async () => {
  const lastScanned = await db.asteroid.findMany({
    take: 10,
    where: {
      scanStatus: {
        not: AsteroidScanStatus.UNSCANNED,
      },
    },
    orderBy: {
      lastScan: 'desc',
    },
  })

  return (
    <div className='flex flex-col items-center gap-y-1'>
      <h1>Last scans</h1>
      <Carousel className='w-3/4'>
        <CarouselContent>
          {lastScanned.map((asteroid) => (
            <CarouselItem
              key={asteroid.id}
              className='sm:basis-1/2 md:basis-1/3 xl:basis-1/4 2xl:basis-1/5'
            >
              <div className='flex flex-col items-center justify-center gap-y-2'>
                {asteroid.rarity && (
                  <p
                    className={cn(
                      Format.asteroidRarityClassName(asteroid.rarity),
                      'text-center text-xl'
                    )}
                  >
                    {Format.asteroidRarity(asteroid.rarity)}
                  </p>
                )}
                <AsteroidImage id={asteroid.id} width={250} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}
