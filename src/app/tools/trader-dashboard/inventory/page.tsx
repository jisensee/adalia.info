import { getWarehouseContents } from '../api'
import { traderDashbboardParamsCache } from '../params'
import { InventoryTable } from './table'
import { influenceApi } from '@/lib/influence-api/api'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } = traderDashbboardParamsCache.parse(searchParams)
  if (!walletAddress) {
    return null
  }
  const [warehouseContents, floorPrices] = await getWarehouseContents(walletAddress)
  const asteroidIds = warehouseContents.map((wc) => wc.asteroidId)
  const asteroidNames = await influenceApi.util.asteroidNames(asteroidIds)

  return (
    <InventoryTable
      warehouseContents={warehouseContents}
      asteroidNames={asteroidNames}
      floorPrices={floorPrices}
    />
  )
}
