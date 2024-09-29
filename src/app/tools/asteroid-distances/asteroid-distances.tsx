'use client'

import { useQueryStates } from 'nuqs'
import { useQuery } from '@tanstack/react-query'
import { F } from '@mobily/ts-belt'
import { Rocket } from 'lucide-react'
import { DistancesChart } from './distances-chart'
import { asteroidDistancesParams } from './params'
import { Settings } from './settings'
import { CloseAsteroids } from './close-asteroids'
import { calculateDistances } from './distances'
import { resolveTrips } from './actions'
import { AsteroidTripsForm } from './form'

export const AsteroidDistances = () => {
  const [params] = useQueryStates(asteroidDistancesParams)

  const { data } = useQuery({
    queryKey: ['trips', params.trips, params.realDaysToShow],
    placeholderData: F.identity,
    queryFn: async () => {
      const resolvedTrips = await resolveTrips(params.trips)
      return {
        trips: resolvedTrips,
        distances: calculateDistances(resolvedTrips, params.realDaysToShow),
      }
    },
  })
  return (
    <div>
      <div className='flex flex-wrap items-end gap-x-3 gap-y-2'>
        <Settings />
        <AsteroidTripsForm trips={data?.trips ?? []} />
      </div>
      {data?.distances && params.trips.length > 0 && (
        <DistancesChart distances={data.distances} trips={data.trips} />
      )}
      {params.trips.length === 0 && (
        <div className='flex flex-col items-center justify-center p-5'>
          <Rocket size={64} />
          <span className='text-center text-2xl text-primary'>
            Add a trip to get started!
          </span>
          <span className='text-center'>
            Alternatively, search for close asteroids below and add trips from
            there.
          </span>
        </div>
      )}
      <CloseAsteroids />
    </div>
  )
}
