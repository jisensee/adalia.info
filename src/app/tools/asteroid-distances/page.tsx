import { createSerializer } from 'nuqs'
import { redirect } from 'next/navigation'
import { AsteroidDistances } from './asteroid-distances'
import { asteroidDistancesParams, asteroidDistancesParamsCache } from './params'

export const metadata = {
  title: 'Asteroid Distances | adalia.info',
}

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { origin, destinations, ...params } =
    asteroidDistancesParamsCache.parse(searchParams)
  if (origin && destinations) {
    const serialize = createSerializer(asteroidDistancesParams)
    const newTrips = destinations.map((d) => ({ origin, destination: d }))
    const newParams = {
      ...params,
      trips: [...params.trips, ...newTrips],
    }
    return redirect(`/tools/asteroid-distances${serialize(newParams)}`)
  }
  return (
    <div className='space-y-3 p-3'>
      <h1>Asteroid Distances</h1>
      <p>
        Add trips to the chart to see how close the asteroids of each trip are
        to each other over time.
      </p>
      <p>
        <span className='font-bold text-primary'>Tip:</span> Bookmark this page
        to save your current setup.
      </p>
      <AsteroidDistances />
    </div>
  )
}
