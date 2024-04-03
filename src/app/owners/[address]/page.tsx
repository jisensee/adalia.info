import { AsteroidScanStatus } from '@prisma/client'
import { Balances } from './balances'
import { OwnerAsteroidsButton } from './owner-asteroids-button'
import { Statistics } from './statistics'
import { Address } from '@/components/address'
import { AsteroidImage } from '@/components/asteroid-image'
import { db } from '@/server/db'
import { Separator } from '@/components/ui/separator'
import { fixAddressForInfluenceApi, rarityToScore } from '@/lib/utils'

type Params = {
  params: {
    address: string
  }
}
export default async function OwnerPage({ params }: Params) {
  const where = { ownerAddress: fixAddressForInfluenceApi(params.address) }
  const [
    ownedAsteroids,
    {
      _sum: { surfaceArea },
    },
    ownedCount,
    scannedCount,
    rarities,
  ] = await db.$transaction([
    db.asteroid.findMany({
      where,
      take: 5,
      orderBy: {
        radius: 'desc',
      },
    }),
    db.asteroid.aggregate({
      where,
      _sum: {
        surfaceArea: true,
      },
    }),
    db.asteroid.count({ where }),
    db.asteroid.count({
      where: { ...where, scanStatus: { not: AsteroidScanStatus.UNSCANNED } },
    }),
    db.asteroid.groupBy({
      where,
      by: ['rarity'],
    }),
  ])
  const [highestRarity] =
    rarities
      .flatMap(({ rarity }) =>
        rarity ? ([[rarity, rarityToScore(rarity)]] as const) : []
      )
      .sort((a, b) => b[1] - a[1])[0] ?? []

  return (
    <div className='flex flex-col gap-y-3 p-3'>
      <div className='flex flex-wrap gap-3'>
        <Address address={params.address} shownCharacters={4} heading />
        <Balances address={params.address} hideAsteroids />
      </div>
      <Separator className='mt-2 bg-primary' />
      <Statistics
        ownedCount={ownedCount}
        scannedCount={scannedCount}
        totalSurfaceArea={surfaceArea ?? 0}
        highestRarity={highestRarity}
        address={params.address}
      />
      <div className='flex flex-row items-center gap-x-5'>
        <h2>Largest asteroids</h2>
        <OwnerAsteroidsButton address={params.address} />
      </div>
      <div className='flex flex-row flex-wrap gap-5'>
        {ownedAsteroids.map((asteroid) => (
          <AsteroidImage key={asteroid.id} id={asteroid.id} width={300} />
        ))}
      </div>
    </div>
  )
}
