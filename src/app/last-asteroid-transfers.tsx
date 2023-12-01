import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'
import { db } from '@/server/db'
import { Address } from '@/components/address'

export const LastAsteroidTransfers = async () => {
  const lastOwnerChanges = await db.asteroidOwnerChange.findMany({
    take: 10,
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      asteroid: true,
    },
  })

  return (
    <div className='flex flex-col gap-y-1'>
      <h1>Last owner changes</h1>
      <div className='grid grid-cols-[auto,auto,auto,1fr] items-center justify-center gap-x-3 gap-y-5 overflow-x-auto rounded-md border border-primary px-5 py-2'>
        {lastOwnerChanges.map(({ asteroid, ...change }) => (
          <Fragment key={change.id}>
            <Link
              className='text-primary md:text-xl'
              href={`/asteroids/${asteroid.id}`}
            >
              {asteroid.id}
            </Link>
            {change.fromAddress ? (
              <Address address={change.fromAddress} shownCharacters={4} />
            ) : (
              '0x0'
            )}
            <ArrowRight size={30} />
            <Address address={change.toAddress} shownCharacters={4} />
          </Fragment>
        ))}
      </div>
    </div>
  )
}
