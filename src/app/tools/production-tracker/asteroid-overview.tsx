'use client'

import { FC, ReactNode, useState } from 'react'
import { Check, Cog, Hourglass, List } from 'lucide-react'
import { Building } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { A, F, pipe } from '@mobily/ts-belt'
import { EntityStatusCard } from './entity-status'
import { TrackerAsteroidData } from './api'
import { EntityData, getEntityData } from './entity-data'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Toggle } from '@/components/ui/toggle'
import { useNow } from '@/hooks/timers'

type StatusFilter = 'all' | 'finished' | 'busy' | 'idle'

export type AsteroidOverviewProps = {
  data: TrackerAsteroidData
  entityMap: Map<string, InfluenceEntity>
  floorPrices: Map<number, number>
}

const isBusy = (data: EntityData) =>
  data.type !== 'idle-building' &&
  'duration' in data &&
  data.duration.remainingSeconds > 0
const isIdle = (data: EntityData) => data.type === 'idle-building'
const isFinished = (data: EntityData) =>
  data.type !== 'idle-building' && data.duration.remainingSeconds <= 0

export const AsteroidOverview = ({
  entityMap,
  data: { asteroidName, asteroidActivities, asteroidIdleBuildings },
}: AsteroidOverviewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [buildingFilter, setBuildingFilter] = useState<number[]>([])
  const now = useNow()

  const activityData = A.filterMap(asteroidActivities, (activity) =>
    getEntityData({
      activity,
      now,
      entityMap,
    })
  )
  const idleBuildingData = A.filterMap(asteroidIdleBuildings, (idleBuilding) =>
    getEntityData({
      idleBuilding,
      now,
      entityMap,
    })
  )
  const asteroidData = [...activityData, ...idleBuildingData].filter(Boolean)

  const filteredAsteroidData = pipe(
    asteroidData,
    A.filter((d) => {
      switch (statusFilter) {
        case 'all':
          return true
        case 'finished':
          return isFinished(d)
        case 'busy':
          return isBusy(d)
        case 'idle':
          return isIdle(d)
      }
    }),
    A.filter(
      (d) =>
        buildingFilter.length === 0 ||
        buildingFilter.includes(d.building.Building?.buildingType ?? 0)
    ),
    A.sortBy((d) => d.duration?.remainingSeconds ?? Number.MAX_VALUE)
  )

  const busyEntities = asteroidData.filter(isBusy).length
  const idleEntities = asteroidData.filter(isIdle).length
  const finishedEntities = asteroidData.filter(isFinished).length

  const availableBuildings = pipe(
    asteroidData,
    A.filterMap((d) => d.building.Building?.buildingType),
    A.uniq,
    A.sortBy(F.identity)
  )

  return (
    <AccordionItem value={asteroidName}>
      <Header
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        buildingFilter={buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
        asteroid={asteroidName}
        allCount={asteroidData.length}
        finishedCount={finishedEntities}
        busyCount={busyEntities}
        idleCount={idleEntities}
        availableBuildings={availableBuildings}
      />
      <AccordionContent>
        <div className='grid grid-cols-1 gap-3 py-1 lg:grid-cols-2 2xl:grid-cols-3'>
          {filteredAsteroidData.map((d) => (
            <EntityStatusCard key={d.id} data={d} now={now} />
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
