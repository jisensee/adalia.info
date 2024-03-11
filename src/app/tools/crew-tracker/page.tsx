import { createSearchParamsCache } from 'nuqs/server'
import { crewTrackerParams } from './params'
import { CrewTracker } from './crew-tracker'
import { CrewTrackerForm } from './form'

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
        <p>Enter a wallet address and check the status of all your crews.</p>
      )}
      <CrewTrackerForm walletAddress={walletAddress ?? undefined} />
      {walletAddress && <CrewTracker walletAddress={walletAddress} />}
    </div>
  )
}
