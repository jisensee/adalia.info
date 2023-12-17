import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/server/db'
import { Address } from '@/components/address'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Format } from '@/lib/format'

export const LastAsteroidPurchases = async () => {
  const lastPurchases = await db.asteroidOwnerChange.findMany({
    take: 10,
    where: {
      fromAddress: null,
    },
    orderBy: {
      timestamp: 'desc',
    },
    include: {
      asteroid: true,
    },
  })

  return (
    <div className='flex flex-col gap-y-1'>
      <h1>Last purchases</h1>
      <Table>
        <TableBody>
          {lastPurchases.map(({ asteroid, ...change }) => (
            <TableRow key={change.id}>
              <TableCell>
                <Link
                  className='text-primary md:text-xl'
                  href={`/asteroids/${asteroid.id}`}
                >
                  {asteroid.id}
                </Link>
              </TableCell>
              <TableCell className='whitespace-nowrap'>
                {Format.asteroidSize(asteroid.size)}{' '}
                <span className='text-primary'>
                  {Format.asteroidSpectralType(asteroid.spectralType)}
                </span>
              </TableCell>
              <TableCell>
                <ArrowRight size={30} />
              </TableCell>
              <TableCell className='w-full'>
                <Address address={change.toAddress} shownCharacters={4} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
