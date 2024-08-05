'use client'

import { Product } from '@influenceth/sdk'
import { ColumnDef } from '@tanstack/react-table'
import { ProductAmount } from '../product-amount'
import { SwayAmount } from '@/components/sway-amount'

export type InventoryRow = {
  product: number
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
    id: 'product-amount',
    header: 'Amount',
    accessorFn: (row) => row.amount,
    enableSorting: true,
    cell: ({ row }) => (
      <ProductAmount
        product={Product.getType(row.original.product)}
        amount={row.original.amount}
        onlyAmount
        hideBadges
        hideIcon
      />
    ),
  },
  {
    id: 'product',
    header: 'Product',
    accessorFn: (row) => Product.getType(row.product).name,
    enableSorting: true,
    cell: ({ row }) => (
      <ProductAmount
        product={Product.getType(row.original.product)}
        amount={row.original.amount}
        onlyName
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
