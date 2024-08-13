'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { useTransition } from 'react'
import { ShipForSale } from './api'
import { columns } from './table-columns'
import { shipsForSaleParams } from './params'
import { ShipsForSaleFilters } from './filters'
import { DataTable } from '@/components/ui/data-table'

export type ShipsForSaleTableProps = {
  ships: ShipForSale[]
  filterAsteroidName?: string
}

export const ShipsForSaleTable = ({
  ships,
  filterAsteroidName,
}: ShipsForSaleTableProps) => {
  const [loading, startTransition] = useTransition()
  const [filters, setFilters] = useQueryStates(shipsForSaleParams, {
    shallow: false,
    startTransition,
  })

  const table = useReactTable({
    data: ships,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [{ id: 'price', desc: false }],
    },
  })
  return (
    <div className='space-y-1'>
      <ShipsForSaleFilters filters={filters} onFiltersChange={setFilters} />
      <h2>
        {ships.length} ships for sale
        {filterAsteroidName ? ` on ${filterAsteroidName}` : ' in the belt'}
      </h2>
      <DataTable table={table} loading={loading} />
    </div>
  )
}
