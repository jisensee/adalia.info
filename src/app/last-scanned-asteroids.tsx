import { AsteroidScanStatus } from '@prisma/client'
import { AsteroidImage } from '@/components/asteroid-image'
import { db } from '@/server/db'

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
    <div className='flex flex-col gap-y-1'>
      <h1>Last scans</h1>
      <div className='flex w-full flex-row gap-7 overflow-x-scroll rounded-md border border-primary px-5 py-3'>
        {lastScanned.map((a) => (
          <AsteroidImage
            key={a.id}
            className='shrink-0'
            id={a.id}
            width={250}
          />
        ))}
      </div>
    </div>
  )
}
