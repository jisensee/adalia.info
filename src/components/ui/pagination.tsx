import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role='navigation'
    aria-label='pagination'
    className={cn('flex w-full', className)}
    {...props}
  />
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center', className)}
    {...props}
  />
))
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = ButtonProps

const PaginationLink = ({ className, ...props }: PaginationLinkProps) => (
  <Button
    className={cn('w-10', className)}
    variant='outline'
    size='icon'
    {...props}
  />
)
PaginationLink.displayName = 'PaginationLink'

export { Pagination, PaginationContent, PaginationItem, PaginationLink }
