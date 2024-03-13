'use client'

import { FC, ReactNode, useState } from 'react'
import { Cog, Hourglass, List } from 'lucide-react'
import { isFuture, isPast } from 'date-fns'
import { CrewStatusData } from './api'
import { CrewStatus } from './crew-status'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Filter = 'all' | 'busy' | 'idle'

export const AsteroidOverview = ({
  location,
  crews,
}: {
  location: string
  crews: CrewStatusData[]
}) => {
  const [filter, setFilter] = useState<Filter>('all')

  const busyCrews = crews.filter((c) => isFuture(c.readyAt))
  const idleCrews = crews.filter((c) => isPast(c.readyAt))

  const shownCrews = (() => {
    if (filter === 'idle') return idleCrews
    if (filter === 'busy') return busyCrews
    return crews
  })().toSorted((a, b) => a.readyAt.getTime() - b.readyAt.getTime())

  return (
    <AccordionItem value={location}>
      <Header
        filter={filter}
        onFilterChange={setFilter}
        location={location}
        allCount={crews.length}
        busyCount={busyCrews.length}
        idleCount={idleCrews.length}
      />
      <AccordionContent>
        {shownCrews.length === 0 && <p>Nothing to see here...</p>}
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
          {shownCrews.map((crew) => (
            <CrewStatus key={crew.name} crew={crew} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

type HeaderProps = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  location: string
  allCount: number
  busyCount: number
  idleCount: number
}

const Header: FC<HeaderProps> = ({
  filter,
  onFilterChange,
  location,
  allCount,
  busyCount,
  idleCount,
}) => (
  <div className='flex w-full items-center justify-between gap-x-3 2xl:justify-start'>
    <AccordionTrigger>
      <h2>{location}</h2>
    </AccordionTrigger>
    {location !== 'In Flight' && (
      <Tabs value={filter} onValueChange={(v) => onFilterChange(v as Filter)}>
        <TabsList>
          <TabButton
            value='all'
            text='All'
            icon={<List size={15} />}
            count={allCount}
          />
          <TabButton
            value='busy'
            text='Busy'
            icon={<Cog size={15} />}
            count={busyCount}
          />
          <TabButton
            value='idle'
            text='Idle'
            icon={<Hourglass size={15} />}
            count={idleCount}
          />
        </TabsList>
      </Tabs>
    )}
  </div>
)

type TabButtonProps = {
  value: Filter
  text: ReactNode
  icon: ReactNode
  count: number
}

const TabButton: FC<TabButtonProps> = ({ text, icon, count, value }) => (
  <TabsTrigger value={value} className='space-x-1'>
    {icon}
    <span className='hidden text-xs md:inline'>
      {text} ({count})
    </span>
    <span className='text-xs md:hidden'>{count}</span>
  </TabsTrigger>
)
