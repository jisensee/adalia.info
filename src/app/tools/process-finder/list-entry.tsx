import { FC, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

export type ListEntryProps = {
  selected: boolean
} & PropsWithChildren

export const ListEntry: FC<ListEntryProps> = ({ selected, children }) => (
  <div
    className={cn(
      'my-[1px] cursor-pointer rounded px-1 hover:bg-primary hover:text-primary-foreground',
      {
        'bg-primary text-primary-foreground': selected,
      }
    )}
  >
    {children}
  </div>
)
