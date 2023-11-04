'use client'

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Route } from 'next'
import { FC, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AsteroidsPageParams, buildAsteroidsUrl } from './types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type PaginatorProps = {
  params: AsteroidsPageParams
  totalPages: number
}

export const Paginator: FC<PaginatorProps> = ({ params, totalPages }) => {
  const paginatorButton = (button: ReactNode, href?: string) => {
    if (href) {
      return <Link href={href as Route}>{button}</Link>
    } else {
      return button
    }
  }

  const { push } = useRouter()

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 15

  const pagingControls = (
    <div className='flex'>
      {paginatorButton(
        <Button
          className='w-10 rounded-r-none'
          variant='outline'
          size='icon'
          disabled={page === 1}
        >
          <ChevronFirst />
        </Button>,
        page > 1 ? buildAsteroidsUrl({ ...params, page: 1 }) : undefined
      )}
      {paginatorButton(
        <Button
          className='w-10 rounded-none'
          variant='outline'
          size='icon'
          disabled={page === 1}
        >
          <ChevronLeft />
        </Button>,
        page > 1 ? buildAsteroidsUrl({ ...params, page: page - 1 }) : undefined
      )}
      {paginatorButton(
        <Button
          className='w-10 rounded-none'
          size='icon'
          variant='outline'
          disabled={page === totalPages}
        >
          <ChevronRight />
        </Button>,
        buildAsteroidsUrl({ ...params, page: page + 1 })
      )}
      {paginatorButton(
        <Button
          className='w-10 rounded-l-none'
          size='icon'
          variant='outline'
          disabled={page === totalPages}
        >
          <ChevronLast />
        </Button>,
        page < totalPages
          ? buildAsteroidsUrl({ ...params, page: totalPages })
          : undefined
      )}
    </div>
  )

  const pageIndicator = (
    <span>
      <span className='hidden sm:inline'>Page</span> {page} /{' '}
      {totalPages.toLocaleString()}
    </span>
  )

  const pageSizeSelect = (
    <div className='flex flex-row items-center gap-x-2'>
      Page size
      <Select
        defaultValue={pageSize.toString()}
        onValueChange={(value) => {
          const newPageSize = parseInt(value, 10)
          push(buildAsteroidsUrl({ ...params, page: 1, pageSize: newPageSize }))
        }}
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
