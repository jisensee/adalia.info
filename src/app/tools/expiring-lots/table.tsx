'use client'

import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Building, Entity, Lot } from '@influenceth/sdk'
import { getEntityName } from 'influence-typed-sdk/api'
import { O } from '@mobily/ts-belt'
import { useTransition } from 'react'
import { useQueryStates } from 'nuqs'
import { Clock } from 'lucide-react'
import { formatRelative } from 'date-fns'
import { ExpiringLot } from './api'
import { expiringLotsParams } from './params'
import { ExpiringLotsFilters } from './filters'
import { LotLink } from '@/components/lot-link'
import { DataTable } from '@/components/ui/data-table'
import { useCsvDownload } from '@/hooks/csv'
import { Format } from '@/lib/format'
import { useRemainingSeconds } from '@/hooks/timers'
import { Address } from '@/components/address'
import { StandardTooltip } from '@/components/ui/tooltip'

export type ExpiringLotsTableProps = {
  lots: ExpiringLot[]
}
export const ExpiringLotsTable = ({ lots }: ExpiringLotsTableProps) => {
  const [loading, startTransition] = useTransition()

  const [filters, setFilters] = useQueryStates(expiringLotsParams, {
    shallow: false,
    startTransition,
  })

  const table = useReactTable({
    data: lots,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [
        {
          id: 'end-time',
          desc: false,
        },
      ],
    },
  })

  const onCsvExport = useCsvDownload('expiring-leases.csv', lots, (lot) => ({
    lotIndex: Lot.toIndex(Entity.unpackEntity(lot.lotUuid).id),
    asteroidId: lot.asteroidId,
    building: getEntityName(lot.building),
    buildingType: O.map(
      lot.building.Building?.buildingType,
      (b) => Building.getType(b).name
    ),
    endTime: lot.endTime.toISOString(),
  }))

  return (
    <div className='space-y-3'>
      <ExpiringLotsFilters filters={filters} onFiltersChange={setFilters} />
      <DataTable table={table} onCsvExport={onCsvExport} loading={loading} />
    </div>
  )
}

const columns: ColumnDef<ExpiringLot>[] = [
  {
    id: 'lot-uuid',
    header: 'Lot',
    accessorFn: (row) => row.lotUuid,
    cell: ({ row }) => <LotLink uuid={row.original.lotUuid} />,
    enableSorting: false,
  },
  {
    id: 'asteroid',
    header: 'Asteroid',
    accessorFn: (row) => row.asteroidName,
    enableSorting: true,
  },
  {
    id: 'building-type',
    header: 'Building Type',
    accessorFn: (row) =>
      O.map(
        row.building.Building?.buildingType,
        (b) => Building.getType(b).name
      ),
    enableSorting: true,
  },
  {
    id: 'building',
    header: 'Building Name',
    accessorFn: (row) => getEntityName(row.building),
    enableSorting: true,
  },
  {
    id: 'owner',
    header: 'Owner',
    accessorFn: (row) => row.crew.Crew?.delegatedTo,
    cell: ({ row }) => (
      <Address
        address={row.original.crew.Crew?.delegatedTo ?? ''}
        shownCharacters={4}
      />
    ),
  },
  {
    id: 'end-time',
    header: 'Expiry',
    accessorFn: (row) => row.endTime.getTime(),
    cell: ({ row }) => (
      <div className='flex items-center gap-x-3'>
        <EndTimeCell endTime={row.original.endTime} />
        <StandardTooltip
          content={formatRelative(row.original.endTime, new Date())}
        >
          <Clock size={20} />
        </StandardTooltip>
      </div>
    ),
    enableSorting: true,
  },
]

const EndTimeCell = ({ endTime }: { endTime: Date }) => {
  const remainingSeconds = useRemainingSeconds(endTime)
  return <span>{Format.remainingTime(remainingSeconds)}</span>
}
