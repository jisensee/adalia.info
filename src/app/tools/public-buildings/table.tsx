'use client'

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { useMemo } from 'react'
import { isPast } from 'date-fns'
import { PublicBuilding } from './api'
import { columns } from './table-columns'
import { publicBuildingsParams } from './params'
import { DataTable } from '@/components/ui/data-table'

export type PublicBuldingsTableProps = {
  buildings: PublicBuilding[]
  asteroidName: string
}

export const PublicBuildingsTable = ({
  buildings,
  asteroidName,
}: PublicBuldingsTableProps) => {
  const shownBuildings = useShownBuildings(buildings)
  const [{ habitatLotIndex }] = useQueryStates(publicBuildingsParams)
  const table = useReactTable({
    data: shownBuildings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility: {
        distance: !!habitatLotIndex,
      },
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [{ id: 'rate', desc: false }],
    },
  })
  return (
    <div className='space-y-1'>
      <h2>
        {shownBuildings.length} available buildings found on {asteroidName}
      </h2>
      <DataTable table={table} />
    </div>
  )
}

const useShownBuildings = (buildings: PublicBuilding[]) => {
  const [{ showBusyBuildings }] = useQueryStates(publicBuildingsParams)

  return useMemo(
    () =>
      buildings.filter((building) => {
        if (showBusyBuildings || !building.freeAt) return true
        return isPast(building.freeAt)
      }),
    [buildings, showBusyBuildings]
  )
}
