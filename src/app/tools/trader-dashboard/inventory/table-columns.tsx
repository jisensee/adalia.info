'use client'

import { ProductType } from '@influenceth/sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ProductAmount } from '../product-amount'
import { SwayAmount } from '@/components/sway-amount'

export type InventoryRow = {
  product: ProductType
  amount: number
  marketValue: number
  floorPrice: number
  warehouses: {
    name: string
    id: number
    asteroidId: number
  }[]
}

export const columns: ColumnDef<InventoryRow>[] = [
  {
    id: 'product',
    header: 'Product',
    accessorFn: (row) => row.amount,
    enableSorting: true,
    cell: ({ row }) => (
      <ProductAmount
        product={row.original.product}
        amount={row.original.amount}
      />
    ),
  },
  {
    id: 'warehouses',
    header: 'Warehouses',
    accessorFn: (row) => row.warehouses,
    cell: (p) => p.row.original.warehouses.map((w) => w.name).join(', '),
  },
  {
    id: 'market-value',
    header: 'Market Value',
    accessorFn: (row) => row.marketValue,
    enableSorting: true,
    cell: (p) => <SwayAmount sway={p.row.original.marketValue} />,
  },
  {
    id: 'floor-price',
    header: 'Floor Price',
    accessorFn: (row) => row.floorPrice,
    cell: (p) => <SwayAmount sway={p.row.original.floorPrice} />,
  },
]
