import { Product } from '@influenceth/sdk'
import { createSearchParamsCache } from 'nuqs/server'
import { ProcessFinderForm } from './form'
import { WarehouseParam, warehousesParams } from './params'
import { ProcessFinderResults } from './results'
import { ProductAmount } from './state'
import { Settings } from './settings'
import { getWarehouseInventory } from '@/lib/influence-api'

export default async function ProcessFinderPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { warehouses } =
    createSearchParamsCache(warehousesParams).parse(searchParams)
  const warehouseProducts = await getProducts(warehouses)

  return (
    <div className='space-y-3 p-3'>
      <h1>Process Finder</h1>
      <p>
        Add your warehouses and see what processes you can run with your
        inventory. Click on products or processes to highlight connected
        entries.
      </p>
      <p>
        <span className='font-bold text-primary'>Tip:</span> Bookmark this page
        after adding your warehouses to quickly access it later.
      </p>
      <div className='flex flex-col gap-x-20 gap-y-3 md:flex-row'>
        <ProcessFinderForm warehouses={warehouses} />
        <Settings />
      </div>

      {warehouseProducts.length > 0 && (
        <ProcessFinderResults warehouseProducts={warehouseProducts} />
      )}
    </div>
  )
}

const getProducts = async (
  warehouses: WarehouseParam[]
): Promise<ProductAmount[]> => {
  const inventories = await Promise.all(
    warehouses.map((w) => getWarehouseInventory(w.asteroidId, w.lotId))
  )
  const products = inventories.flatMap((content) =>
    content.map((c) => ({
      product: Product.getType(c.product),
      amount: c.amount,
    }))
  )

  const groupedProducts: Map<number, ProductAmount> = new Map()
  products.forEach((p) => {
    const existing = groupedProducts.get(p.product.i)
    if (existing) {
      groupedProducts.set(p.product.i, {
        product: p.product,
        amount: existing.amount + p.amount,
      })
    } else {
      groupedProducts.set(p.product.i, p)
    }
  })

  return Array.from(groupedProducts.values())
}
