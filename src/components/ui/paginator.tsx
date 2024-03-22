import { Table } from '@tanstack/react-table'
import { FC } from 'react'
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from './pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Button } from './button'
import { cn } from '@/lib/utils'

type PaginatorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>
  loading?: boolean
  onCsvExport?: () => void
}

export const Paginator: FC<PaginatorProps> = ({
  table,
  loading,
  onCsvExport,
}) => {
  const { pageSize, pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()

  const pagingControls = (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            className='rounded-r-none'
            onClick={() => table.setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronFirst />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            className='rounded-none'
            onClick={table.previousPage}
            disabled={pageIndex === 0}
          >
            <ChevronLeft />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            className='rounded-none'
            onClick={table.nextPage}
            disabled={pageIndex === pageCount - 1}
          >
            <ChevronRight />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            className='rounded-l-none'
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
          >
            <ChevronLast />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
  const pageIndicator = (
    <span className='whitespace-nowrap'>
      <span className='hidden sm:inline'>Page</span>{' '}
      {(pageIndex + 1).toLocaleString()} / {pageCount.toLocaleString()}
    </span>
  )

  const pageSizeSelect = (
    <div className='flex flex-row items-center gap-x-2 whitespace-nowrap'>
      Page size
      <Select
        defaultValue={pageSize.toString()}
        disabled={loading}
        onValueChange={(value) =>
          table.setPageSize(parseInt(value as string, 10))
        }
      >
        <SelectTrigger className='w-20'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'15'}>15</SelectItem>
          <SelectItem value={'25'}>25</SelectItem>
          <SelectItem value={'50'}>50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <>
      <div
        className={cn('hidden w-full items-center justify-end sm:flex', {
          'justify-between': onCsvExport,
        })}
      >
        {onCsvExport && (
          <Button onClick={onCsvExport} icon={<Download />}>
            Export CSV
          </Button>
        )}
        <div className='flex items-center justify-end gap-x-5'>
          {pageSizeSelect}
          {pageIndicator}
          {pagingControls}
        </div>
      </div>
      <div className='flex flex-col gap-y-3 sm:hidden'>
        <div className='flex flex-row items-center justify-end gap-x-5'>
          {pageIndicator}
          {pagingControls}
        </div>
        <div className='flex flex-row justify-end'>{pageSizeSelect}</div>
      </div>
    </>
  )
}
