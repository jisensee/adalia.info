'use client'

import { FileDown } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { objectToSearchString } from 'serialize-query-params'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AsteroidFilterSummary } from '@/components/asteroid-filters/filter-summary'

export type ExportProps = {
  totalCount: number
  searchParams: Record<string, string | string[]>
}

export const Export = ({ totalCount, searchParams }: ExportProps) => {
  const [format, setFormat] = useState('csv')
  const filtersActive = totalCount < 250_000
  const [mode, setMode] = useState<'all' | 'filtered'>(
    filtersActive ? 'filtered' : 'all'
  )
  const [open, setOpen] = useState(false)

  const formatSelect = (
    <Select value={format} onValueChange={setFormat}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='csv'>CSV</SelectItem>
        <SelectItem value='json'>JSON</SelectItem>
      </SelectContent>
    </Select>
  )

  const typeSelect = (
    <div className='flex flex-col gap-y-2'>
      <div
        className={cn('cursor-pointer rounded-lg border border-primary p-2', {
          'opacity-50': mode === 'filtered',
        })}
        onClick={() => setMode('all')}
      >
        <p className='text-primary'>Full export</p>
        <p>Export all existing asteroids</p>
      </div>
      <div
        className={cn('cursor-pointer rounded-lg border border-primary p-2', {
          'opacity-50': mode === 'all',
          'cursor-not-allowed': !filtersActive,
        })}
        onClick={() => filtersActive && setMode('filtered')}
      >
        <p className='text-primary'>Filtered export</p>
        <p className='mb-1'>
          Export all currently selected {totalCount.toLocaleString()} asteroids
        </p>
        <AsteroidFilterSummary searchParams={searchParams} readonly />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' icon={<FileDown />}>
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export asteroids</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-y-2'>
          <p>Export either your currently selected or all asteroids.</p>

          <h2>Format</h2>
          {formatSelect}

          <h2>Export type</h2>
          {typeSelect}
          {!filtersActive && (
            <p className='text-sm italic'>
              You have to apply some filters to export a selection of asteroids.
            </p>
          )}
          <p className='mb-2'>
            Please give appropritate credit to adalia.info when publishing
            something that is derived from this data. Thank you!
          </p>
          <Link
            href={`/asteroids/export?${objectToSearchString(
              searchParams
            )}&format=${format}`}
            onClick={() => setOpen(false)}
          >
            <Button className='w-full' icon={<FileDown />}>
              Export {totalCount.toLocaleString()} asteroids
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
