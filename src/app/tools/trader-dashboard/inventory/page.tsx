import { getWarehouseContents } from '../api'
import { traderDashbboardParamsCache } from '../params'
import { InventoryTable } from './table'
import { preReleaseInfluenceApi } from '@/lib/influence-api/api'

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } = traderDashbboardParamsCache.parse(searchParams)
  if (!walletAddress) {
    return null
  }
  const warehouseContents = await getWarehouseContents(walletAddress)
  const asteroidIds = warehouseContents.map((wc) => wc.asteroidId)
  const products = [
    ...new Set(
      warehouseContents.flatMap((wc) => wc.contents.map((c) => c.product.i))
    ),
  ]
  const [asteroidNames, floorPrices] = await Promise.all([
    preReleaseInfluenceApi.util.asteroidNames(asteroidIds),
    preReleaseInfluenceApi.util.floorPrices(products),
  ])
  return (
    <InventoryTable
      warehouseContents={warehouseContents}
      asteroidNames={asteroidNames}
      floorPrices={floorPrices}
    />
  )
}
