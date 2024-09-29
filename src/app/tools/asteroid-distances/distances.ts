import { Time } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { startOfDay } from 'date-fns'
import { ResolvedTrip } from './actions'
import { getAsteroidDistance } from '@/lib/utils'

export const calculateDistances = (
  trips: ResolvedTrip[],
  realDaysToShow: number
) => {
  const now = Time.fromUnixMilliseconds(startOfDay(new Date()).getTime())
  return pipe(
    A.range(0, realDaysToShow),
    A.map((offset) => Time.fromOrbitADays(now.toOrbitADays() + offset * 24)),
    A.map((time) => ({
      time: time.toGameClockADays(),
      distances: pipe(
        trips,
        A.map(
          (trip) =>
            [
              trip.id,
              getAsteroidDistance(trip.origin, trip.destination, time),
            ] as const
        ),
        D.fromPairs
      ),
    }))
  )
}

export const distancesAtTime = (
  origin: InfluenceEntity,
  destinations: InfluenceEntity[],
  distancesAt: Date
) => {
  const time = Time.fromUnixMilliseconds(distancesAt.getTime())

  return destinations.map((destination) => ({
    destination,
    distance: getAsteroidDistance(origin, destination, time),
  }))
}
