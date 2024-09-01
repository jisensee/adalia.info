import { Entity, Time } from '@influenceth/sdk'
import { A, D, N, pipe } from '@mobily/ts-belt'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { startOfDay } from 'date-fns'
import { DistancesChart } from './distances-chart'
import { asteroidDistancesParamsCache } from './params'
import { AsteroidDistancesForm } from './form'
import { Settings } from './settings'
import { getAsteroidDistance } from '@/lib/utils'
import { influenceApi } from '@/lib/influence-api/api'

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const params = asteroidDistancesParamsCache.parse(searchParams)
  const ids =
    params.origin && params.destinations
      ? [params.origin, ...params.destinations]
      : null
  const asteroids = ids
    ? await influenceApi.entities({
        id: ids,
        label: Entity.IDS.ASTEROID,
      })
    : []

  const asteroidNames = pipe(
    asteroids ?? [],
    A.map((asteroid) => [asteroid.id, getEntityName(asteroid)] as const),
    (e) => new Map(e)
  )

  const origin = asteroids.find((a) => a.id === params.origin)
  const destinations = asteroids.filter((a) =>
    params.destinations?.includes(a.id)
  )

  const distances =
    origin && destinations.length > 0
      ? calculateDistances(
          origin,
          destinations,
          N.clamp(params.realDaysToShow, 1, 2000)
        )
      : null

  return (
    <div className='space-y-3 p-3'>
      <h1>Asteroid Distances</h1>
      <p>
        Select one origin asteroid and up to 10 destinations to see the
        distances between them over time.
      </p>
      <p>
        <span className='font-bold text-primary'>Tip:</span> Bookmark this page
        to save your current setup.
      </p>
      <div className='flex gap-x-3'>
        <AsteroidDistancesForm asteroidNames={asteroidNames} />
        <Settings />
      </div>
      {distances && (
        <DistancesChart distances={distances} asteroidNames={asteroidNames} />
      )}
    </div>
  )
}

const calculateDistances = (
  origin: InfluenceEntity,
  destinations: InfluenceEntity[],
  realDaysToShow: number
) => {
  const now = Time.fromUnixMilliseconds(startOfDay(new Date()).getTime())
  return pipe(
    A.range(0, realDaysToShow),
    A.map((offset) => Time.fromOrbitADays(now.toOrbitADays() + offset * 24)),
    A.map((time) => ({
      time: time.toGameClockADays(),
      asteroidDistances: pipe(
        destinations,
        A.map(
          (destination) =>
            [
              destination.id,
              getAsteroidDistance(origin, destination, time),
            ] as const
        ),
        D.fromPairs
      ),
    }))
  )
}
