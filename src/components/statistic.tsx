import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatisticProps = {
  title: ReactNode
  value: ReactNode
  compact?: boolean
  valueClassName?: string
  onClick?: () => void
}
export const Statistic = ({
  title,
  value,
  valueClassName,
  compact,
  onClick,
}: StatisticProps) => (
  <div
    className={cn('group rounded-md border border-primary p-3', {
      'flex flex-row items-center gap-x-2': compact,
      'cursor-pointer hover:bg-primary hover:text-primary-foreground': onClick,
    })}
    onClick={onClick}
  >
    <p
      className={cn(
        'text-center text-2xl font-bold text-primary',
        valueClassName,
        { 'group-hover:text-primary-foreground': onClick }
      )}
    >
      {value}
    </p>
    <p className='text-center text-sm font-bold'>{title}</p>
  </div>
)
