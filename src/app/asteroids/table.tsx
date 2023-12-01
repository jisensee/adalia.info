'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { FC, Fragment, useMemo, useTransition } from 'react'
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import { Asteroid } from '@prisma/client'
import { Sort, useAsteroidPageParams } from './types'
import {
  AsteroidColumn,
  columnDef,
  nonSortableColumns,
  toAsteroidRow,
} from './columns'
import { useAsteroidColumns } from './hooks'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AsteroidImage } from '@/components/asteroid-image'
import { AsteroidActionButton } from '@/components/asteroid-action-button'

export type AsteroidTableProps = {
  data: Asteroid[]
}

const calcNextSortState = (
  currentSort: Sort,
  colId: AsteroidColumn
): Sort | undefined => {
  if (currentSort.direction === 'asc' && currentSort.id === colId) {
    return { id: colId, direction: 'desc' }
  } else {
    return { id: colId, direction: 'asc' }
  }
}

export const AsteroidTable: FC<AsteroidTableProps> = ({ data }) => {
  const [isLoading, startTransition] = useTransition()
  const [pageParams, setPageParams] = useAsteroidPageParams(startTransition)

  const [columns] = useAsteroidColumns()

  const visibleColumns = [{ id: 'id', active: true }, ...columns]
    .filter((col) => col.active)
    .flatMap((col) => {
      const def = columnDef.find((c) => c.id === col.id)
      return def ? [def] : []
    })
  const rows = useMemo(() => data.map(toAsteroidRow), [data])
  const table = useReactTable({
    data: rows,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            <TableHead />
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {!nonSortableColumns.includes(
                  header.column.id as AsteroidColumn
                ) ? (
                  <div
                    className='flex cursor-pointer flex-row items-center gap-x-2'
                    onClick={() =>
                      setPageParams({
                        ...pageParams,
                        page: 1,
                        sort: calcNextSortState(
                          pageParams.sort,
                          header.column.id as AsteroidColumn
                        ),
                      })
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {pageParams.sort?.id === header.column.id &&
                      pageParams.sort?.direction === 'asc' && <ArrowUp />}
                    {pageParams.sort?.id === header.column.id &&
                      pageParams.sort?.direction === 'desc' && <ArrowDown />}
                  </div>
                ) : header.isPlaceholder ? null : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className={isLoading ? 'opacity-50' : ''}>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                <TableCell>
                  <ChevronRight
                    className={cn(
                      'cursor-pointer text-primary transition-all duration-100 ease-in-out',
                      {
                        'rotate-90 transform': row.getIsExpanded(),
                      }
                    )}
                    onClick={() => row.toggleExpanded()}
                  />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='whitespace-nowrap'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1}>
                    <div className='flex w-fit flex-col gap-x-5 gap-y-3 md:flex-row'>
                      <AsteroidImage id={row.original.id} width={350} />
                      <div className='flex flex-col gap-y-3 md:justify-center'>
                        <AsteroidActionButton.Details id={row.original.id} />
                        <AsteroidActionButton.Game id={row.original.id} />
                        <AsteroidActionButton.Coorbitals
                          orbitalPeriod={row.original.orbitalPeriod}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className='h-24 text-center'>
              No asteroids found that match your filter.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
