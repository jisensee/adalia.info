'use client'

import { FC, ReactNode, useState } from 'react'
import { Check, Cog, Hourglass, List } from 'lucide-react'
import { isPast } from 'date-fns'
import { A, F, pipe } from '@mobily/ts-belt'
import { Building, Processor } from '@influenceth/sdk'
import { EntityStatus, EntityStatusCard } from './entity-status'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Toggle } from '@/components/ui/toggle'

type StatusFilter = 'all' | 'finished' | 'busy' | 'idle'

export type AsteroidOverviewProps = {
  asteroid: string
  entities: EntityStatus[]
}

const isBusy = (entity: EntityStatus) => entity.type !== 'idleBuilding'
const isIdle = (entity: EntityStatus) => entity.type === 'idleBuilding'
const isFinished = (entity: EntityStatus) => isPast(entity.finishTime)

const applyStatusFilter = (
  entities: EntityStatus[],
  statusFilter: StatusFilter
) => {
  if (statusFilter === 'idle') return entities.filter(isIdle)
  if (statusFilter === 'busy') return entities.filter(isBusy)
  if (statusFilter === 'finished') return entities.filter(isFinished)
  return entities
}

const processorToBuilding = (processorType: number) => {
  switch (processorType) {
    case Processor.IDS.REFINERY:
      return Building.IDS.REFINERY
    case Processor.IDS.BIOREACTOR:
      return Building.IDS.BIOREACTOR
    case Processor.IDS.FACTORY:
      return Building.IDS.FACTORY
    case Processor.IDS.SHIPYARD:
      return Building.IDS.SHIPYARD
    default:
      return undefined
  }
}

const applyBuldingFilter = (entities: EntityStatus[], buildings: number[]) =>
  entities.filter((e) => {
    if (buildings.length === 0) return true
    switch (e.type) {
      case 'extractor':
        return buildings.includes(Building.IDS.EXTRACTOR)
      case 'process':
        return buildings.includes(processorToBuilding(e.processorType) ?? -1)
      case 'idleBuilding':
        return buildings.includes(e.buildingType)
      default:
        return false
    }
  })

export const AsteroidOverview = ({
  asteroid,
  entities,
}: AsteroidOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [buildingFilter, setBuildingFilter] = useState<number[]>([])

  const busyEntities = entities.filter(isBusy)
  const idleEntities = entities.filter(isIdle)
  const finishedEntities = entities.filter(isFinished)

  const availableBuildings = pipe(
    entities,
    A.filterMap((e) => {
      switch (e.type) {
        case 'extractor':
          return Building.IDS.EXTRACTOR
        case 'process':
          return processorToBuilding(e.processorType) ?? -1
        case 'idleBuilding':
          return e.buildingType
        default:
          return undefined
      }
    }),
    A.uniq,
    A.sortBy(F.identity)
  )

  const shownEntities = pipe(
    entities,
    (e) => applyStatusFilter(e, statusFilter),
    (e) => applyBuldingFilter(e, buildingFilter),
    A.sortBy((e) =>
      e.type === 'idleBuilding' ? Number.MAX_VALUE : e.finishTime.getTime()
    )
  )

  return (
    <AccordionItem value={asteroid}>
      <Header
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        buildingFilter={buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        asteroid={asteroid}
        allCount={entities.length}
        finishedCount={finishedEntities.length}
        busyCount={busyEntities.length}
        idleCount={idleEntities.length}
        availableBuildings={availableBuildings}
      />
      <AccordionContent>
        {shownEntities.length === 0 && <p>Nothing to see here...</p>}
        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3'>
          {shownEntities.map((entity) => (
            <EntityStatusCard key={entity.lotUuid} status={entity} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

type HeaderProps = {
  statusFilter: StatusFilter
  onStatusFilterChange: (filter: StatusFilter) => void
  buildingFilter: number[]
  onBuildingFilterChange: (filter: number[]) => void
  asteroid: string
  allCount: number
  finishedCount: number
  busyCount: number
  idleCount: number
  availableBuildings: number[]
}

const Header: FC<HeaderProps> = ({
  statusFilter,
  onStatusFilterChange,
  buildingFilter,
  onBuildingFilterChange,
  asteroid,
  allCount,
  finishedCount,
  busyCount,
  idleCount,
  availableBuildings,
}) => (
  <div className='flex w-full flex-col justify-between gap-x-3 pb-2 lg:flex-row lg:items-center lg:pb-0 2xl:justify-start'>
    <AccordionTrigger>
      <h2>{asteroid}</h2>
    </AccordionTrigger>
    <div className='flex flex-wrap gap-1'>
      {availableBuildings.map((b) => (
        <BuildingToggle
          key={b}
          buildingType={b}
          buildingFilter={buildingFilter}
          setBuildingFilter={onBuildingFilterChange}
        />
      ))}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
      >
        <TabsList className='ml-1'>
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
  </div>
)

type TabButtonProps = {
  value: StatusFilter
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

const BuildingToggle = ({
  buildingType,
  buildingFilter,
  setBuildingFilter,
}: {
  buildingType: number
  buildingFilter: number[]
  setBuildingFilter: (newFilter: number[]) => void
}) => (
  <Toggle
    variant='outline'
    pressed={buildingFilter.includes(buildingType)}
    size='sm'
    onPressedChange={(pressed) =>
      setBuildingFilter(
        pressed
          ? [...buildingFilter, buildingType]
          : buildingFilter.filter((b) => b !== buildingType)
      )
    }
  >
    {Building.getType(buildingType).name}
  </Toggle>
)
