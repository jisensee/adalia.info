'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ProductProduction } from '../api'
import { ProductAmount } from '../product-amount'
import { Format } from '@/lib/format'
import { SwayAmount } from '@/components/sway-amount'

export const columns: ColumnDef<ProductProduction>[] = [
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
    id: 'producers',
    header: 'Producers',
    accessorFn: (row) => row.producers,
    enableSorting: true,
    cell: ({ row }) => row.original.producers.toLocaleString(),
  },
  {
    id: 'producer-average',
    header: 'Producer Average',
    accessorFn: (row) => row.amount / row.producers,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      original.product.isAtomic
        ? Format.bigNumber(original.amount / original.producers)
        : Format.mass(original.amount / original.producers),
  },
  {
    id: 'recipes',
    header: 'Recipes',
    accessorFn: (row) => row.recipes,
    enableSorting: true,
    cell: ({ row }) =>
      row.original.recipes
        ? Math.round(row.original.recipes).toLocaleString()
        : 'N/A',
  },
  {
    id: 'floor-price',
    header: 'Floor Price',
    accessorFn: (row) => row.floorPrice,
    enableSorting: true,
    cell: ({ row }) => <SwayAmount sway={row.original.floorPrice} />,
  },
  {
    id: 'market-value',
    header: 'Market Value',
    accessorFn: (row) => row.amount * row.floorPrice,
    enableSorting: true,
    cell: ({ row }) => (
      <SwayAmount sway={row.original.amount * row.original.floorPrice} />
    ),
  },
]
