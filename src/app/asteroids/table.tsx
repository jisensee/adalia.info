'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { FC, Fragment } from 'react'
import { ArrowDown, ArrowUp, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Asteroid } from '@prisma/client'
import {
  AsteroidColumnConfig,
  AsteroidsPageParams,
  Sort,
  buildAsteroidsUrl,
} from './types'
import {
  AsteroidColumn,
  columnDef,
  nonSortableColumns,
  toAsteroidRow,
} from './columns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AsteroidPreview } from '@/components/asteroid-preview'

export type AsteroidTableProps = {
  columns: AsteroidColumnConfig[]
  data: Asteroid[]
  pageParams: AsteroidsPageParams
}

const calcNextSortState = (
  pageParams: AsteroidsPageParams,
  colId: AsteroidColumn
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
  const visibleColumns = [{ id: 'id', active: true }, ...columns]
    .filter((col) => col.active)
    .flatMap((col) => {
      const def = columnDef.find((c) => c.id === col.id)
      return def ? [def] : []
    })
  const rows = data.map(toAsteroidRow)
  const table = useReactTable({
    data: rows,
    columns: visibleColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='overflow-x-auto rounded-md border'>
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
                    <Link
                      className='flex flex-row items-center gap-x-2'
                      href={buildAsteroidsUrl({
                        ...pageParams,
                        page: 1,
                        pageSize: undefined,
                        sorting: calcNextSortState(
                          pageParams,
                          header.column.id as AsteroidColumn
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
                        pageParams.sorting?.direction === 'desc' && (
                          <ArrowDown />
                        )}
                    </Link>
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
        <TableBody>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={columns.length + 1}>
                      <AsteroidPreview asteroid={row.original} />
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
    </div>
  )
}
