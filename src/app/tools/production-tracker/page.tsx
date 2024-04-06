import { createSearchParamsCache } from 'nuqs/server'
import { Metadata } from 'next'
import { ProductionTrackerForm } from './form'
import { productionTrackerParams } from './params'
import { ProductionTracker } from './tracker'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Production Tracker | adalia.info',
}

export default async function ProductionTrackerPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } = createSearchParamsCache(
    productionTrackerParams
  ).parse(searchParams)

  return (
    <div className='space-y-3 p-3'>
      <h1>Production Tracker</h1>
      <div>
        <p className={cn({ hidden: walletAddress })}>
          Enter a wallet address and check the status of all your production
          facilities.
        </p>
        <ProductionTrackerForm walletAddress={walletAddress ?? undefined} />
      </div>
      {walletAddress && <ProductionTracker walletAddress={walletAddress} />}
    </div>
  )
}
