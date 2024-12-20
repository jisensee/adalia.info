'use client'

import { A } from '@mobily/ts-belt'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { Inventory, Product, Ship, Time } from '@influenceth/sdk'
import { differenceInSeconds, formatRelative, isFuture } from 'date-fns'
import { Fuel, Trophy } from 'lucide-react'
import Link from 'next/link'
import { getLeaderboard, Race } from './data'
import { getPlaceColor, PriceEntry } from './price-pool'
import { ShipIcon } from '@/components/influence-asset-icons'
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineHeader,
  TimelineIcon,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from '@/components/timeline'
import { cn } from '@/lib/utils'
import { Format } from '@/lib/format'
import { useLocalDate } from '@/hooks/date'

export type LeaderboardEntryProps = {
  asteroidNames: Map<number, string>
  race: Race
  place: number
  entry: ReturnType<typeof getLeaderboard>[number]
}

export const LeaderboardEntry = ({
  race,
  entry,
  place,
}: Omit<LeaderboardEntryProps, 'asteroidNames'>) => (
  <div className='flex gap-x-1 rounded p-1 ring-1 ring-primary hover:ring-2'>
    <ShipIcon ship={entry.ship.Ship?.shipType ?? 1} size={100} />
    <div className='flex grow flex-col items-start'>
      <span className='text-xl'>
        <span className='text-xl text-primary'>{entry.playerName}</span> with{' '}
        <span className='text-xl text-primary'>
          {getEntityName(entry.ship)}
        </span>
      </span>
      <span className='text-sm'>
        Visited Asteroids:{' '}
        <span className='font-bold text-primary'>{entry.score}</span>
      </span>
    </div>
    {place >= 1 && place <= 3 && (
      <PriceEntry
        className='ml-2 pr-2'
        place={place as 1 | 2 | 3}
        swayAmount={
          [race.firstPrice, race.secondPrice, race.thirdPrice][place - 1] ?? 0
        }
      />
    )}
  </div>
)

const TimeDisplay = ({ date }: { date: Date }) => (
  <TimelineTime className='text-md !-translate-x-24 font-mono font-thin'>
    {Time.fromUnixMilliseconds(date.getTime())
      .toGameClockADays()
      .toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
  </TimelineTime>
)

const TimeContent = ({ date }: { date: Date }) => {
  const localDate = useLocalDate(date)
  return (
    <TimelineContent>
      <TimelineDescription>
        <span className='font-bold'>
          {formatRelative(localDate, new Date())}
        </span>{' '}
        - {date.toLocaleString()}
      </TimelineDescription>
    </TimelineContent>
  )
}

export const LeaderBoardEntryDetails = ({
  place,
  entry,
  asteroidNames,
}: LeaderboardEntryProps) => {
  const transits = A.sortBy(entry.transits, (t) => -t.departure)
  const asteroidLink = (id: number) => (
    <Link
      className='text-lg font-bold hover:underline'
      href={`/asteroids/${id}`}
    >
      {asteroidNames.get(id) ?? ''}
    </Link>
  )
  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-x-3'>
        <div className={cn('flex items-center gap-x-1', getPlaceColor(place))}>
          <Trophy />
          <p className='text-2xl font-bold'>{place}</p>
        </div>
        <h1>{entry.playerName}</h1>
      </div>
      <p className='text-lg'>
        Visited Asteroids:{' '}
        <span className='font-bold text-primary'>{entry.score}</span>
      </p>
      <ShipStatus ship={entry.ship} />
      <Timeline className='max-h-[60vh] overflow-y-auto pl-20 pt-2'>
        {transits.flatMap((transit, index) => {
          const departureInFuture = isFuture(transit.departure)
          const arrivalInFuture = isFuture(transit.arrival)
          return [
            <TimelineItem
              key={transit.arrival.getTime()}
              className={cn({
                'opacity-50': arrivalInFuture,
              })}
            >
              <TimelineConnector />
              <TimelineHeader>
                <TimeDisplay date={transit.arrival} />
                <TimelineIcon />
                <TimelineTitle>
                  {arrivalInFuture ? 'Arriving' : 'Arrived'} at{' '}
                  {asteroidLink(transit.destination)}
                  {arrivalInFuture
                    ? ` in ${Format.remainingTime(
                        differenceInSeconds(transit.arrival, new Date())
                      )}`
                    : ''}
                </TimelineTitle>
              </TimelineHeader>
              <TimeContent date={transit.arrival} />
            </TimelineItem>,
            <TimelineItem
              key={transit.departure.getTime()}
              className={cn({
                'opacity-50': departureInFuture,
              })}
            >
              {index < transits.length - 1 && <TimelineConnector />}
              <TimelineHeader>
                <TimeDisplay date={transit.departure} />
                <TimelineIcon />
                <TimelineTitle>
                  {departureInFuture ? 'Departing' : 'Departed'} from{' '}
                  {asteroidLink(transit.origin)}
                </TimelineTitle>
              </TimelineHeader>
              <TimeContent date={transit.departure} />
            </TimelineItem>,
          ]
        })}
      </Timeline>
    </div>
  )
}

const ShipStatus = ({ ship }: { ship: InfluenceEntity }) => {
  const shipType = Ship.getType(ship.Ship?.shipType ?? 1)
  const fuelCapacity =
    Inventory.getType(shipType.propellantInventoryType).massConstraint / 1_000
  const availableFuel =
    ship.Inventories.find(
      (i) => i.inventoryType === shipType.propellantInventoryType
    )?.contents?.find((c) => c.product === Product.IDS.HYDROGEN_PROPELLANT)
      ?.amount ?? 0
  const fuel = availableFuel / fuelCapacity

  return (
    <div className='flex items-end gap-x-1'>
      <ShipIcon ship={ship.Ship?.shipType ?? 1} size={100} />
      <div className='flex flex-col'>
        <p className='text-xl text-primary'>{getEntityName(ship)}</p>
        <p>{shipType.name}</p>
      </div>
      <div
        className={cn('ml-3 flex items-center gap-x-2 whitespace-nowrap', {
          'text-success': fuel >= 0.75,
          'text-warning': fuel < 0.75 && fuel > 0.25,
          'text-destructive': fuel <= 0.25,
        })}
      >
        <Fuel />
        <span className='text-2xl'>{Format.percentage(fuel)}</span>
      </div>
    </div>
  )
}
