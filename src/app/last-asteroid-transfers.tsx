import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Fragment } from 'react'
import { Logo } from '@/components/logo'
import { Format } from '@/lib/format'
import { db } from '@/server/db'

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
            <div className='flex flex-row gap-x-2'>
              {change.fromChain ? (
                <Logo.Blockchain blockchain={change.fromChain} size={25} />
              ) : (
                <Logo.Ethereum size={25} />
              )}
              <span className='md:text-xl'>
                {change.fromAddress
                  ? Format.ethAddress(change.fromAddress, 2)
                  : '0x0'}
              </span>
            </div>
            <ArrowRight size={30} />
            <div className='flex flex-row gap-x-2'>
              <Logo.Blockchain blockchain={change.toChain} size={25} />
              <span className='md:text-xl'>
                {Format.ethAddress(change.toAddress, 2)}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
