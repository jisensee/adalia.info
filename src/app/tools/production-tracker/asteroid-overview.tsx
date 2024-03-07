'use client'

import { FC, ReactNode, useState } from 'react'
import { Check, Cog, Hourglass, List } from 'lucide-react'
import { EntityStatus, EntityStatusCard } from './entity-status'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Filter = 'all' | 'finished' | 'busy' | 'idle'

export const AsteroidOverview = ({
  asteroid,
  entities,
}: {
  asteroid: string
  entities: EntityStatus[]
}) => {
  const [filter, setFilter] = useState<Filter>('all')

  const busyEntities = entities.filter((e) => e.type !== 'idleBuilding')
  const idleEntities = entities.filter((e) => e.type === 'idleBuilding')
  const finishedEntities = entities.filter(
    (e) => e.type !== 'idleBuilding' && e.remainingSeconds <= 0
  )

  const shownEntities = (() => {
    if (filter === 'idle') return idleEntities
    if (filter === 'busy') return busyEntities
    if (filter === 'finished') return finishedEntities
    return entities
  })().toSorted((a, b) => {
    const aValue =
      a.type === 'idleBuilding' ? Number.MAX_VALUE : a.remainingSeconds
    const bValue =
      b.type === 'idleBuilding' ? Number.MAX_VALUE : b.remainingSeconds
    return aValue - bValue
  })

  return (
    <AccordionItem value={asteroid}>
      <Header
        filter={filter}
        onFilterChange={setFilter}
        asteroid={asteroid}
        allCount={entities.length}
        finishedCount={finishedEntities.length}
        busyCount={busyEntities.length}
        idleCount={idleEntities.length}
      />
      <AccordionContent>
        {shownEntities.length === 0 && <p>Nothing to see here...</p>}
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3'>
          {shownEntities.map((entity, index) => (
            <EntityStatusCard key={index} status={entity} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

type HeaderProps = {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  asteroid: string
  allCount: number
  finishedCount: number
  busyCount: number
  idleCount: number
}

const Header: FC<HeaderProps> = ({
  filter,
  onFilterChange,
  asteroid,
  allCount,
  finishedCount,
  busyCount,
  idleCount,
}) => (
  <div className='flex w-full items-center justify-between gap-x-3 2xl:justify-start'>
    <AccordionTrigger>
      <h2>{asteroid}</h2>
    </AccordionTrigger>
    <Tabs value={filter} onValueChange={(v) => onFilterChange(v as Filter)}>
      <TabsList>
        <TabButton
          value='all'
          text='All'
          icon={<List size={15} />}
          count={allCount}
        />
        <TabButton
          value='finished'
          text='Finished'
          icon={<Check size={15} />}
          count={finishedCount}
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
