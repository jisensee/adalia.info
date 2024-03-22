'use client'

import { FC, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ProductType } from '@influenceth/sdk'
import { WarehouseContent } from '../api'
import { InventoryRow, columns } from './table-columns'

import { InventoryFilter, TableFilters } from './filters'
import { groupArrayBy } from '@/lib/utils'
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
  asteroidNames: Map<number, string>
  floorPrices: Map<number, number>
}

export const InventoryTable: FC<InventoryTableProps> = ({
  warehouseContents,
  asteroidNames,
}) => {
  const [rows, setRows] = useState(combineWarehouses(warehouseContents, {}))
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
  const uniqueProducts = new Set(rows.map((r) => r.product.i)).size
  const warehouses = new Set(
    rows.map((r) => r.warehouses.map((w) => w.id)).flat()
  ).size

  const warehouseNames = new Map<number, string>()
  warehouseContents.forEach((wc) =>
    warehouseNames.set(wc.warehouseId, wc.warehouseName)
  )

  const onCsvExport = useCsvDownload('inventory.csv', rows, (row) => ({
    product: row.product.name,
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
                setRows(combineWarehouses(warehouseContents, newFilter))
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
          value={<SwayAmount sway={totalValue} large />}
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
              doesProductMatch(product, productFilter)
            )
          : wc.contents,
    }))

  const grouped = groupArrayBy(
    filteredContents.flatMap((wc) =>
      wc.contents.map((c) => ({
        ...c,
        warehouseName: wc.warehouseName,
        asteroidId: wc.asteroidId,
        warehouseId: wc.warehouseId,
      }))
    ),
    (i) => i.product.i
  )

  return [...grouped.values()].flatMap((rows) => {
    const first = rows[0]
    if (!first) {
      return []
    }
    const totalAmount = rows.reduce((acc, row) => acc + row.amount, 0)
    const totalMarketValue = rows.reduce((acc, row) => acc + row.marketValue, 0)
    return {
      ...first,
      amount: totalAmount,
      marketValue: totalMarketValue,
      warehouses: rows.map((wh) => ({
        name: wh.warehouseName,
        id: wh.warehouseId,
        asteroidId: wh.asteroidId,
      })),
    }
  })
}
