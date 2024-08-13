import { Metadata } from 'next'
import { Entity } from '@influenceth/sdk'
import { getEntityName } from 'influence-typed-sdk/api'
import { shipsForSale } from './api'
import { ShipsForSaleTable } from './table'
import { shipsForSaleParamsCache } from './params'
import { influenceApi } from '@/lib/influence-api/api'

export const metadata: Metadata = {
  title: 'Ships For Sale | adalia.info',
}

export default async function ShipsForSalePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const filters = shipsForSaleParamsCache.parse(searchParams)
  const [ships, filterAsteroid] = await Promise.all([
    shipsForSale(filters),
    filters.asteroidId
      ? influenceApi.entity({
          label: Entity.IDS.ASTEROID,
          id: filters.asteroidId,
        })
      : undefined,
  ])

  const filterAsteroidName = filterAsteroid ? getEntityName(filterAsteroid) : ''

  return (
    <div className='space-y-3 p-3'>
      <h1>Ships For Sale</h1>
      <ShipsForSaleTable
        ships={ships}
        filterAsteroidName={filterAsteroidName}
      />
    </div>
  )
}
