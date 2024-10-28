'use client'

import { differenceInSeconds, formatRelative } from 'date-fns'
import { Check, Hourglass } from 'lucide-react'

import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { Fragment } from 'react'
import { Entity } from '@influenceth/sdk'
import { EntityData } from './entity-data'
import { Progress } from '@/components/ui/progress'
import { Format } from '@/lib/format'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  BuildingIcon,
  ProductIcon,
  ShipIcon,
} from '@/components/influence-asset-icons'
import { LotLink } from '@/components/lot-link'
import { CrewImage, CrewmateImage } from '@/components/crew'

export type EntityStatusCardProps = {
  data: EntityData
  now: Date
}

export const EntityStatusCard = ({ data, now }: EntityStatusCardProps) => {
  const crew = 'crew' in data ? data.crew : undefined
  const crewCaptainId = crew?.Crew?.roster[0]
  const crewImage = crewCaptainId && (
    <CrewmateImage crewmateId={crewCaptainId} width={64} />
  )

  const timeInfo = (
    <div className='flex items-center justify-end gap-x-1'>
      {data.type === 'idle-building' && (
        <span className='text-xl text-primary'>Idle</span>
      )}
      {data.type !== 'idle-building' && data.duration.remainingSeconds <= 0 && (
        <div className='flex items-center gap-x-2 whitespace-nowrap text-primary'>
          <Check />
          <span className='text-xl'>Finished</span>
        </div>
      )}
      {data.type !== 'idle-building' && data.duration.remainingSeconds > 0 && (
        <div className='flex flex-col items-end'>
          <div className='flex items-center gap-x-2 whitespace-nowrap text-primary'>
            <Hourglass className='inline' />{' '}
            <span className='text-2xl'>
              {Format.remainingTime(data.duration.remainingSeconds)}
            </span>
          </div>
          <p className='hidden whitespace-nowrap text-sm text-primary md:block'>
            {formatRelative(data.duration.end, now)}
          </p>
        </div>
      )}
    </div>
  )
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            'flex cursor-pointer flex-col justify-between gap-x-3 rounded ring-1 ring-primary hover:ring-2',
            {
              'p-1': data.type === 'idle-building',
            }
          )}
        >
          <div className='flex items-start'>
            <div className='flex w-fit shrink-0 items-center gap-x-1'>
              {crewImage}
              {data.icon?.(64)}
            </div>
            <div className='flex w-full flex-col justify-start gap-2 px-2 py-1 md:flex-row md:justify-between'>
              <div className='flex flex-col'>
                <div>
                  <h3 className='line-clamp-1'>{data.name}</h3>
                  {'subtext' in data && data.subtext}
                </div>
              </div>
              {timeInfo}
            </div>
          </div>
          {data.type !== 'idle-building' &&
            data.type !== 'rented-production' && (
              <EntityProgress {...data.duration} />
            )}
        </div>
      </DialogTrigger>
      <Details data={data} now={now} />
    </Dialog>
  )
}

const Details = ({ data }: EntityStatusCardProps) => {
  const otherOutputs = 'outputs' in data && data.outputs.length > 1 && (
    <div className='grid grid-cols-[auto,1fr] items-center gap-x-1 gap-y-2'>
      <h3 className='col-span-2'>Other Outputs</h3>
      {data.outputs
        .filter((o) => !o.primary)
        .map((output) => (
          <Fragment key={output.product}>
            <ProductIcon product={output.product} size={40} />
            <span className='text-lg'>
              {Format.productAmount(output.product, output.amount)}
            </span>
          </Fragment>
        ))}
    </div>
  )
  const location = (
    <LotLink
      uuid={data.building.Location?.resolvedLocations?.lot?.uuid ?? ''}
    />
  )
  const buildingInfo = data.type === 'idle-building' && (
    <div className='flex gap-x-2'>
      <BuildingIcon
        building={data.building.Building?.buildingType ?? 1}
        size={128}
      />
      <div className='space-y-1'>
        <p className='text-lg font-bold'>{getEntityName(data.building)}</p>
        {location}
      </div>
    </div>
  )
  const origin = 'origin' in data && data.origin && (
    <Inventory inventory={data.origin} />
  )
  const destination = 'destination' in data && data.destination && (
    <Inventory inventory={data.destination} />
  )
  const crew = 'crew' in data ? data.crew : undefined
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{data.name}</DialogTitle>
      </DialogHeader>
      <div className='space-y-2'>
        {buildingInfo}
        {data.type !== 'idle-building' && (
          <div className='flex gap-x-2'>
            {data.icon(128)}
            <div className='w-full space-y-1'>
              {'subtext' in data && <p>{data.subtext}</p>}
              {data.type !== 'rented-production' && (
                <EntityProgress {...data.duration} showDuration />
              )}
              {'duration' in data && data.duration.remainingSeconds > 0 && (
                <p className='w-full text-center text-sm text-primary'>
                  {formatRelative(data.duration.end, new Date())}
                </p>
              )}
            </div>
          </div>
        )}
        {data.type !== 'idle-building' && location}
        {otherOutputs}
        <div className='flex flex-wrap gap-x-10 gap-y-2'>
          {origin && (
            <div className='space-y-1'>
              <h3>Origin</h3>
              {origin}
            </div>
          )}
          {destination && (
            <div className='space-y-1'>
              <h3>Destination</h3>
              {destination}
            </div>
          )}
        </div>
        {crew && <CrewImage crew={crew} width={64} bustOnly />}
      </div>
    </DialogContent>
  )
}

const Inventory = ({ inventory }: { inventory: InfluenceEntity }) => (
  <div className='flex gap-x-2'>
    {inventory.label === Entity.IDS.BUILDING && inventory.Building && (
      <BuildingIcon building={inventory.Building.buildingType} size={128} />
    )}
    {inventory.label === Entity.IDS.SHIP && inventory.Ship && (
      <ShipIcon ship={inventory.Ship.shipType} size={128} />
    )}
    <div className='space-y-1'>
      <p className='text-lg font-bold'>{getEntityName(inventory)}</p>
      <LotLink uuid={inventory.Location?.resolvedLocations?.lot?.uuid ?? ''} />
    </div>
  </div>
)

type EntityProgressProps = {
  start: Date
  end: Date
  remainingSeconds: number
  showDuration?: boolean
}
const EntityProgress = ({
  start,
  end,
  remainingSeconds,
  showDuration,
}: EntityProgressProps) => {
  const duration = differenceInSeconds(end, start)
  const progress = (duration - remainingSeconds) / duration

  return (
    <Progress
      className={cn('h-[5px] rounded-none', {
        'h-8': showDuration,
        'bg-muted': !showDuration,
      })}
      value={progress * 100}
    >
      <span className='text-xl'>
        {showDuration && (
          <div className='flex items-center gap-x-2'>
            {remainingSeconds < 0 ? <Check /> : <Hourglass />}
            <span>
              {remainingSeconds < 0
                ? 'Finished'
                : Format.remainingTime(remainingSeconds)}
            </span>
          </div>
        )}
      </span>
    </Progress>
  )
}
