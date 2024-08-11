'use client'

import { FC, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Product, ProductType } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { WarehouseContent } from '../api'
import { getProductFloorPrice } from '../util'
import { InventoryRow, columns } from './table-columns'

import { InventoryFilter, TableFilters } from './filters'
import { SwayAmount } from '@/components/sway-amount'
import { DataTable } from '@/components/ui/data-table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useCsvDownload } from '@/hooks/csv'
import { Statistic } from '@/components/statistic'

type InventoryTableProps = {
  warehouseContents: WarehouseContent[]
  floorPrices: Map<number, Map<number, number>>
  asteroidNames: Map<number, string>
}

export const InventoryTable: FC<InventoryTableProps> = ({
  warehouseContents,
  floorPrices,
  asteroidNames,
}) => {
  const [rows, setRows] = useState(() =>
    combineWarehouses(warehouseContents, floorPrices, {})
  )
  const [filter, setFilter] = useState<InventoryFilter>({})

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
      sorting: [{ id: 'market-value', desc: true }],
    },
  })

  const totalValue = useMemo(
    () => rows.reduce((acc, row) => acc + row.marketValue, 0),
    [rows]
  )
  const uniqueProducts = new Set(rows.map((r) => r.product)).size
  const warehouses = new Set(
    rows.map((r) => r.warehouses.map((w) => w.id)).flat()
  ).size

  const warehouseNames = new Map<number, string>()
  warehouseContents.forEach((wc) =>
    warehouseNames.set(wc.warehouseId, wc.warehouseName)
  )

  const onCsvExport = useCsvDownload('inventory.csv', rows, (row) => ({
    product: Product.getType(row.product).name,
    amount: row.amount,
    warehouses: row.warehouses.map((wh) => wh.name).join(','),
    marketValue: row.marketValue / 1e6,
  }))

  return (
    <div className='space-y-2'>
      <Accordion type='single' collapsible>
        <AccordionItem value='filters'>
          <AccordionTrigger>Filters</AccordionTrigger>
          <AccordionContent>
            <TableFilters
              filter={filter}
              onFilterChange={(newFilter) => {
                setFilter(newFilter)
                setRows(
                  combineWarehouses(warehouseContents, floorPrices, newFilter)
                )
              }}
              asteroidNames={asteroidNames}
              warehouseNames={warehouseNames}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className='flex flex-wrap items-center gap-2'>
        <Statistic
          title='Total value'
          value={<SwayAmount sway={totalValue} large colored />}
          compact
        />
        <Statistic title='Unique products' value={uniqueProducts} compact />
        <Statistic title='Warehouses' value={warehouses} compact />
      </div>
      <DataTable table={table} onCsvExport={onCsvExport} />
    </div>
  )
}

const doesProductMatch = (product: ProductType, filter: string) =>
  [product.name, product.category, product.classification].some((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  )

const combineWarehouses = (
  contents: WarehouseContent[],
  floorPrices: Map<number, Map<number, number>>,
  filter: InventoryFilter
): InventoryRow[] => {
  const productFilter = filter.product
  const filteredContents = contents
    .filter((wc) => {
      if (filter.warehouseId) {
        return wc.warehouseId === filter.warehouseId
      }
      if (filter.asteroidId) {
        return wc.asteroidId === filter.asteroidId
      }
      return true
    })
    .map((wc) => ({
      ...wc,
      contents:
        productFilter && productFilter.length > 0
          ? wc.contents.filter(({ product }) =>
              doesProductMatch(Product.getType(product), productFilter)
            )
          : wc.contents,
    }))

  return pipe(
    filteredContents,
    A.map((wc) =>
      wc.contents.map((c) => ({
        ...c,
        warehouseName: wc.warehouseName,
        asteroidId: wc.asteroidId,
        warehouseId: wc.warehouseId,
      }))
    ),
    A.flat,
    A.groupBy((i) => i.product),
    D.values,
    A.filterMap((contents) => {
      const withFloorPrice =
        contents?.map((wc) => ({
          ...wc,
          floorPrice: getProductFloorPrice(
            floorPrices,
            wc.asteroidId,
            wc.product
          ),
        })) ?? []
      const cheapest = pipe(
        withFloorPrice,
        A.sortBy(D.prop('floorPrice')),
        A.last
      )
      if (!cheapest) return undefined
      const totalAmount = withFloorPrice.reduce(
        (acc, row) => acc + row.amount,
        0
      )
      const totalMarketValue = withFloorPrice.reduce(
        (acc, row) => acc + row.floorPrice * row.amount,
        0
      )
      return {
        ...cheapest,
        amount: totalAmount,
        marketValue: totalMarketValue,
        warehouses: withFloorPrice.map((wh) => ({
          name: wh.warehouseName,
          id: wh.warehouseId,
          asteroidId: wh.asteroidId,
        })),
      }
    })
  )
}
