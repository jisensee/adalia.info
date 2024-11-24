'use client'

import { formatRelative } from 'date-fns'
import { useLocalDate } from '@/hooks/date'

export const DataUpdateTimestamp = ({ timestamp }: { timestamp: Date }) => {
  const localDate = useLocalDate(timestamp)
  return (
    <div className='text-center'>
      <span className='text-primary'>Last asteroid update: </span>
      <span>{formatRelative(localDate, new Date())}</span>
    </div>
  )
}
