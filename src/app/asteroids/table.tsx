'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { FC } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { Asteroid } from '@prisma/client'
import { AsteroidsPageParams, Sort, buildAsteroidsUrl } from './types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type AsteroidTableProps = {
  columns: ColumnDef<Asteroid, number>[]
  data: Asteroid[]
  pageParams: AsteroidsPageParams
}

const calcNextSortState = (
  pageParams: AsteroidsPageParams,
  colId: keyof Asteroid
): Sort | undefined => {
  const sort = pageParams.sorting

  if (!sort) {
    return { id: colId, direction: 'asc' }
  } else if (sort.direction === 'asc' && sort.id === colId) {
    return { id: colId, direction: 'desc' }
  } else {
    return { id: colId, direction: 'asc' }
  }
}

export const AsteroidTable: FC<AsteroidTableProps> = ({
  columns,
  data,
  pageParams,
}) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  <Link
                    className='flex flex-row items-center gap-x-2'
                    href={buildAsteroidsUrl({
                      ...pageParams,
                      page: 1,
                      pageSize: undefined,
                      sorting: calcNextSortState(
                        pageParams,
                        header.column.id as keyof Asteroid
                      ),
                    })}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {pageParams.sorting?.id === header.column.id &&
                      pageParams.sorting?.direction === 'asc' && <ArrowUp />}
                    {pageParams.sorting?.id === header.column.id &&
                      pageParams.sorting?.direction === 'desc' && <ArrowDown />}
                  </Link>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className='whitespace-nowrap'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
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
    </div>
  )
}
