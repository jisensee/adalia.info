'use client'

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { FC, useTransition } from 'react'
import { useAsteroidPageParams } from './types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type PaginatorProps = {
  totalPages: number
}

export const Paginator: FC<PaginatorProps> = ({ totalPages }) => {
  const [isLoading, startTransition] = useTransition()
  const [pageParams, setPageParams] = useAsteroidPageParams(startTransition)

  const setPage = (page: number) => () => setPageParams({ ...pageParams, page })

  const pagingControls = (
    <div className='flex'>
      <Button
        className='w-10 rounded-r-none'
        variant='outline'
        size='icon'
        disabled={pageParams.page === 1 || isLoading}
        onClick={setPage(1)}
      >
        <ChevronFirst />
      </Button>
      <Button
        className='w-10 rounded-none'
        variant='outline'
        size='icon'
        disabled={pageParams.page === 1 || isLoading}
        onClick={setPage(pageParams.page - 1)}
      >
        <ChevronLeft />
      </Button>
      <Button
        className='w-10 rounded-none'
        size='icon'
        variant='outline'
        disabled={pageParams.page === totalPages || isLoading}
        onClick={setPage(pageParams.page + 1)}
      >
        <ChevronRight />
      </Button>
      <Button
        className='w-10 rounded-l-none'
        size='icon'
        variant='outline'
        disabled={pageParams.page === totalPages || isLoading}
        onClick={setPage(totalPages)}
      >
        <ChevronLast />
      </Button>
    </div>
  )

  const pageIndicator = (
    <span>
      <span className='hidden sm:inline'>Page</span> {pageParams.page} /{' '}
      {totalPages.toLocaleString()}
    </span>
  )

  const pageSizeSelect = (
    <div className='flex flex-row items-center gap-x-2'>
      Page size
      <Select
        defaultValue={pageParams.pageSize.toString()}
        disabled={isLoading}
        onValueChange={(value) =>
          setPageParams({
            ...pageParams,
            page: 1,
            pageSize: parseInt(value, 10),
          })
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
      <div className='hidden flex-row items-center justify-end gap-x-5 sm:flex'>
        {pageSizeSelect}
        {pageIndicator}
        {pagingControls}
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
