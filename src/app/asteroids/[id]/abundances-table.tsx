import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { A, O, pipe } from '@mobily/ts-belt'
import { Product } from '@influenceth/sdk'
import { DataTable } from '@/components/ui/data-table'
import { ProductIcon } from '@/components/influence-asset-icons'
import { InfoTooltip } from '@/components/ui/tooltip'
import { Abundance } from '@/components/abundance'
import { useCsvDownload } from '@/hooks/csv'
import { LotAbundances } from '@/lib/abundances'

export type AbundancesTableProps = {
  asteroidAbundances: LotAbundances[]
  resources: number[]
  selectedResource: number
}
export const AbundancesTable = ({
  asteroidAbundances,
  resources,
  selectedResource,
}: AbundancesTableProps) => {
  const table = useReactTable({
    data: asteroidAbundances,
    columns: makeColumns(resources, selectedResource),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [{ id: 'score', desc: true }],
    },
  })
  const onCsvExport = useCsvDownload(
    'abundances.csv',
    asteroidAbundances,
    ({ lotIndex, summedAbundances, resources }) => ({
      lotIndex,
      score: Math.round(summedAbundances * 100),
      ...pipe(
        resources,
        Object.entries,
        A.map(([resource, abundance]) => [
          Product.getType(parseInt(resource)).name,
          ((abundance as number) * 100).toFixed(1),
        ]),
        Object.fromEntries
      ),
    })
  )

  return <DataTable table={table} onCsvExport={onCsvExport} />
}

const makeColumns = (
  resources: number[],
  selectedResource: number
): ColumnDef<LotAbundances>[] => [
  {
    id: 'lotIndex',
    header: 'Lot',
    accessorFn: (row) => row.lotIndex,
    cell: ({ row }) => `#${row.original.lotIndex.toLocaleString()}`,
    enableSorting: true,
  },
  {
    id: 'score',
    header: () => (
      <div className='flex gap-x-1'>
        Score{' '}
        <InfoTooltip side='right'>
          The higher this score, the more high abundance resources are present
          at a lot. A score of 0 means that only base abunances are present.
        </InfoTooltip>
      </div>
    ),
    accessorFn: (row) => row.summedAbundances,
    cell: ({ row }) =>
      Math.round(row.original.summedAbundances * 100).toLocaleString(),
    enableSorting: true,
  },
  ...resources
    .filter((r) => selectedResource === 0 || r === selectedResource)
    .map(
      (resource) =>
        ({
          id: resource.toString(),
          header: () => (
            <div className='flex gap-x-1'>
              <ProductIcon product={resource} size={24} />
              {Product.getType(resource).name}
            </div>
          ),
          accessorFn: (row) => row.resources[resource],
          cell: ({ row }) =>
            O.map(row.original.resources[resource], (a) => (
              <Abundance abundance={a} color />
            )),
        }) satisfies ColumnDef<LotAbundances>
    ),
]
