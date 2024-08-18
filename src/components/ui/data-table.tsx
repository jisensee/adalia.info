'use client'

import { Table as TableInstance, flexRender } from '@tanstack/react-table'

import { ArrowDown, ArrowUp } from 'lucide-react'
import { Paginator } from './paginator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData> {
  table: TableInstance<TData>
  onCsvExport?: () => void
  loading?: boolean
}

export const DataTable = <TData,>({
  table,
  onCsvExport,
  loading,
}: DataTableProps<TData>) => {
  return (
    <div
      className={cn('flex flex-col items-end gap-y-2', {
        'opacity-50': loading,
      })}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    <div
                      className={cn(
                        'flex flex-row items-center gap-x-2 whitespace-nowrap pr-2',
                        {
                          'cursor-pointer': header.column.getCanSort(),
                        }
                      )}
                      onClick={() => header.column.toggleSorting()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getIsSorted() === 'asc' && <ArrowUp />}
                      {header.column.getIsSorted() === 'desc' && <ArrowDown />}
                    </div>
                  </TableHead>
                )
              })}
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className='h-24 text-center'
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Paginator table={table} onCsvExport={onCsvExport} />
    </div>
  )
}
