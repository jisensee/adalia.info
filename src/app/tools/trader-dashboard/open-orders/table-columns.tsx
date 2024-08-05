'use client'

import { Order, Product } from '@influenceth/sdk'
import { ColumnDef } from '@tanstack/react-table'
import { Check, X } from 'lucide-react'
import { ProductAmount } from '../product-amount'
import { SwayAmount } from '@/components/sway-amount'
import { cn } from '@/lib/utils'

export type OpenOrderRow = {
  type: number
  crew: string
  location: string
  product: number
  amount: number
  price: number
  floorPrice: number
}

export const columns: ColumnDef<OpenOrderRow>[] = [
  {
    id: 'type',
    header: 'Type',
    accessorFn: (row) => row.type,
    enableSorting: true,
    cell: (p) =>
      p.row.original.type === Order.IDS.LIMIT_BUY ? 'Limit Buy' : 'Limit Sell',
  },
  {
    id: 'crew',
    header: 'Crew',
    accessorFn: (row) => row.crew,
    enableSorting: true,
  },
  {
    id: 'location',
    header: 'Location',
    accessorFn: (row) => row.location,
    enableSorting: true,
  },
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
        hideBadges
      />
    ),
  },
  {
    id: 'Order Price',
    header: 'Order Price',
    accessorFn: (row) => row.price,
    enableSorting: true,
    cell: ({ row }) => {
      const isLowest = row.original.price <= row.original.floorPrice
      return (
        <div className='flex items-center gap-x-2'>
          <SwayAmount sway={row.original.price} />
          {row.original.type === Order.IDS.LIMIT_SELL && (
            <div
              className={cn('flex items-center gap-x-1', {
                'text-destructive': !isLowest,
                'text-success': isLowest,
              })}
            >
              {isLowest ? <Check size={20} /> : <X size={20} />}
              {isLowest ? ' Lowest' : ' Above Floor'}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'floor-price',
    header: 'Floor Price',
    accessorFn: (row) => row.floorPrice,
    enableSorting: true,
    cell: ({ row }) => <SwayAmount sway={row.original.floorPrice} />,
  },
  {
    id: 'total-price',
    header: 'Total Price',
    accessorFn: (row) => row.amount * row.price,
    enableSorting: true,
    cell: ({ row }) => (
      <SwayAmount sway={row.original.amount * row.original.price} />
    ),
  },
]
