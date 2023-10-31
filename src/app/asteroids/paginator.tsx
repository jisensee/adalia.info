import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Route } from 'next'
import { FC, ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export type PaginatorProps = {
  page: number
  totalPages: number
  buildUrl: (page: number) => string
}

export const Paginator: FC<PaginatorProps> = ({
  page,
  totalPages,
  buildUrl,
}) => {
  const paginatorButton = (button: ReactNode, href?: string) => {
    if (href) {
      return <Link href={href as Route}>{button}</Link>
    } else {
      return button
    }
  }
  return (
    <div className='flex flex-row items-center justify-end gap-x-5'>
      Page {page} / {totalPages}
      <div className='flex'>
        {paginatorButton(
          <Button className='rounded-r-none' size='icon' disabled={page === 1}>
            <ChevronFirst />
          </Button>,
          page > 1 ? buildUrl(1) : undefined
        )}
        {paginatorButton(
          <Button className='rounded-none' size='icon' disabled={page === 1}>
            <ChevronLeft />
          </Button>,
          page > 1 ? buildUrl(page - 1) : undefined
        )}
        {paginatorButton(
          <Button
            className='rounded-none'
            size='icon'
            disabled={page === totalPages}
          >
            <ChevronRight />
          </Button>,
          buildUrl(page + 1)
        )}
        {paginatorButton(
          <Button
            className='rounded-l-none'
            size='icon'
            disabled={page === totalPages}
          >
            <ChevronLast />
          </Button>,
          page < totalPages ? buildUrl(2500) : undefined
        )}
      </div>
    </div>
  )
}
