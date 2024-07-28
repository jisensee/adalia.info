'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Product } from '@influenceth/sdk'
import { ProductAmount } from '../product-amount'
import { BeltInventoryItem } from './api'
import { SwayAmount } from '@/components/sway-amount'
import { Format } from '@/lib/format'

export const columns: ColumnDef<BeltInventoryItem>[] = [
  {
    id: 'product',
    header: 'Product',
    accessorFn: (row) => row.amount,
    enableSorting: true,
    cell: ({ row }) => (
      <ProductAmount
        product={Product.getType(row.original.product)}
        amount={row.original.amount}
      />
    ),
  },
  {
    id: 'containing-warehouses',
    header: 'Containing Warehouses',
    accessorFn: (row) => row.containingWarehouses,
    enableSorting: true,
    cell: ({ row }) => row.original.containingWarehouses.toLocaleString(),
  },
  {
    id: 'warehouse-average',
    header: 'Warehouse Average',
    accessorFn: (row) => row.amount / row.containingWarehouses,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      Product.getType(original.product).isAtomic
        ? (original.amount / original.containingWarehouses).toLocaleString()
        : Format.mass(original.amount / original.containingWarehouses),
  },
  {
    id: 'floor-price',
    header: 'Floor Price',
    accessorFn: (row) => row.floorPrice,
    enableSorting: true,
    cell: ({ row }) =>
      row.original.floorPrice && <SwayAmount sway={row.original.floorPrice} />,
  },
  {
    id: 'market-value',
    header: 'Market Value',
    accessorFn: (row) => (row.floorPrice ? row.amount * row.floorPrice : 0),
    enableSorting: true,
    cell: ({ row }) =>
      row.original.floorPrice && (
        <SwayAmount sway={row.original.amount * row.original.floorPrice} />
      ),
  },
]
