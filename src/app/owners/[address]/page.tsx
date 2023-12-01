import Link from 'next/link'
import { Balances } from './balances'
import { Address } from '@/components/address'
import { AsteroidImage } from '@/components/asteroid-image'
import { db } from '@/server/db'
import { Button } from '@/components/ui/button'

type Params = {
  params: {
    address: string
  }
}
export default async function OwnerPage({ params }: Params) {
  const ownedAsteroids = await db.asteroid.findMany({
    where: {
      ownerAddress: params.address,
    },
    take: 5,
    orderBy: {
      radius: 'desc',
    },
  })
  return (
    <div className='flex flex-col gap-y-3 p-3'>
      <Address address={params.address} shownCharacters={4} heading />
      <Balances address={params.address} />
      <div className='flex flex-row items-center gap-x-5'>
        <h2>Largest asteroids</h2>
        <Link href={`/asteroids?owners=${params.address}`}>
          <Button variant='outline' size='xs'>
            Show all
          </Button>
        </Link>
      </div>
      <div className='flex flex-row flex-wrap gap-5'>
        {ownedAsteroids.map((asteroid) => (
          <AsteroidImage key={asteroid.id} id={asteroid.id} width={300} />
        ))}
      </div>
    </div>
  )
}
