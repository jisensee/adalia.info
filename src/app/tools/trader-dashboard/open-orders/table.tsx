'use client'

import { FC, useMemo } from 'react'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Order, Product } from '@influenceth/sdk'
import { EntityOrder } from 'influence-typed-sdk/api'
import { getProductFloorPrice } from '../util'
import { OpenOrderRow, columns } from './table-columns'
import { DataTable } from '@/components/ui/data-table'
import { useCsvDownload } from '@/hooks/csv'
import { Statistic } from '@/components/statistic'
import { SwayAmount } from '@/components/sway-amount'

type OpenOrdersTableProps = {
  orders: EntityOrder[]
  crewNames: Map<number, string>
  floorPrices: Map<number, Map<number, number>>
  asteroidNames: Map<number, string>
  marketplaceNames: Map<number, string>
}

export const OpenOrdersTable: FC<OpenOrdersTableProps> = ({
  orders,
  crewNames,
  floorPrices,
  asteroidNames,
  marketplaceNames,
}) => {
  const rows = useMemo<OpenOrderRow[]>(
    () =>
      orders.map((order) => ({
        type: order.orderType,
        crew: crewNames.get(order.crew.id) ?? '',
        asteroid: asteroidNames.get(order.locations.asteroid?.id ?? 0) ?? '',
        marketplace:
          marketplaceNames.get(order.locations.building?.id ?? 0) ?? '',
        price: order.price,
        amount: order.amount,
        product: order.product,
        floorPrice: getProductFloorPrice(
          floorPrices,
          order.locations?.asteroid?.id ?? 0,
          order.product
        ),
      })),
    [orders, asteroidNames, crewNames, floorPrices, marketplaceNames]
  )
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [{ id: 'total-price', desc: true }],
    },
  })

  const onCsvExport = useCsvDownload('open-orders.csv', rows, (order) => ({
    type: order.type === Order.IDS.LIMIT_BUY ? 'Limit Buy' : 'Limit Sell',
    crew: order.crew,
    marketplace: order.marketplace,
    asteroid: order.asteroid,
    product: Product.getType(order.product).name,
    amount: order.amount,
    price: order.price / 1e6,
    floorPrice: order.floorPrice / 1e6,
    totalPrice: (order.amount * order.price) / 1e6,
  }))

  const sellValue = useMemo(
    () =>
      rows
        .filter((row) => row.type === Order.IDS.LIMIT_SELL)
        .reduce((acc, row) => acc + row.amount * row.price, 0),
    [rows]
  )
  const buyValue = useMemo(
    () =>
      rows
        .filter((row) => row.type === Order.IDS.LIMIT_BUY)
        .reduce((acc, row) => acc + row.amount * row.price, 0),
    [rows]
  )

  return (
    <div className='space-y-2'>
      <div className='flex gap-x-3'>
        <Statistic
          title='Limit Sell Value'
          value={<SwayAmount sway={sellValue} large colored />}
          compact
        />
        <Statistic
          title='Limit Buy Value'
          value={
            <SwayAmount
              sway={buyValue === 0 ? 0 : -buyValue}
              large
              colored
              noDecimals
            />
          }
          compact
        />
        <Statistic
          title='Balance'
          value={<SwayAmount sway={sellValue - buyValue} large colored />}
          compact
        />
      </div>

      <DataTable table={table} onCsvExport={onCsvExport} />
    </div>
  )
}
