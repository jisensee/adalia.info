import { createSearchParamsCache } from 'nuqs/server'
import { crewTrackerParams } from './params'
import { CrewTracker } from './crew-tracker'
import { CrewTrackerForm } from './form'
import { getCrews } from './api'
import { influenceApi } from '@/lib/influence-api/api'

export const metadata = {
  title: 'Crew Tracker | adalia.info',
}

export default async function CrewTrackerPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } =
    createSearchParamsCache(crewTrackerParams).parse(searchParams)

  return (
    <div className='space-y-3 p-3'>
      <h1>Crew Tracker</h1>
      {!walletAddress && (
        <p>
          Connect your StarkNet wallet or enter your address manually to check
          the status of all your crews.
        </p>
      )}
      <CrewTrackerForm walletAddress={walletAddress ?? undefined} />
      {walletAddress && <Tracker walletAddress={walletAddress} />}
    </div>
  )
}

const Tracker = async ({ walletAddress }: { walletAddress: string }) => {
  const crews = await getCrews(walletAddress)
  const asteroidIds = crews.flatMap((c) => (c.asteroidId ? [c.asteroidId] : []))
  const asteroidNames = await influenceApi.util.asteroidNames(asteroidIds)

  return <CrewTracker crews={crews} asteroidNames={asteroidNames} />
}
