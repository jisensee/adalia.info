import { createSearchParamsCache } from 'nuqs/server'
import { Metadata } from 'next'
import { Entity, Inventory } from '@influenceth/sdk'
import { getEntityName } from 'influence-typed-sdk/api'
import { addressParams, settingsParams } from './params'
import { ProcessFinderResults } from './results'
import { WalletAddressForm } from './form'
import { Settings } from './settings'
import { influenceApi } from '@/lib/influence-api/api'

export const metadata: Metadata = {
  title: 'Process Finder | adalia.info',
}

const getWarehouses = async (
  walletAddress: string | null,
  warehouseIds: number[] | null
) => {
  if (walletAddress) {
    return influenceApi.util.warehouses(walletAddress)
  } else if (warehouseIds) {
    return influenceApi.entities({
      id: warehouseIds,
      label: Entity.IDS.BUILDING,
    })
  }
}

export default async function ProcessFinderPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } =
    createSearchParamsCache(addressParams).parse(searchParams)
  const { warehouses: warehouseIds } =
    createSearchParamsCache(settingsParams).parse(searchParams)

  const warehouses = await getWarehouses(walletAddress, warehouseIds)

  const asteroidIds = warehouses?.flatMap((w) => {
    const asteroidId = w.Location?.resolvedLocations?.asteroid?.id
    return asteroidId ? [asteroidId] : []
  })

  const asteroidNames = asteroidIds
    ? await influenceApi.util.asteroidNames(asteroidIds)
    : undefined

  const newWarehouses = warehouses
    ? warehouses.map((wh) => {
        return {
          asteroid:
            asteroidNames?.get(
              wh.Location?.resolvedLocations?.asteroid?.id ?? 0
            ) ?? '',
          id: wh.id,
          name: getEntityName(wh),
          products:
            wh.Inventories?.find(
              (i) => i.inventoryType === Inventory.IDS.WAREHOUSE_PRIMARY || i.inventoryType === Inventory.IDS.TANK_FARM_PRIMARY
            )?.contents ?? [],
        }
      })
    : undefined

  return (
    <div className='space-y-3 p-3'>
      <h1>Process Finder</h1>
      {!walletAddress && (
        <p>
          Enter your wallet address to find out what you can do with the
          products in your warehouses.
        </p>
      )}
      <WalletAddressForm walletAddress={walletAddress ?? undefined} />

      {newWarehouses && newWarehouses.length > 0 && (
        <>
          <Settings warehouses={newWarehouses} />
          <ProcessFinderResults warehouses={newWarehouses} />
        </>
      )}
    </div>
  )
}
