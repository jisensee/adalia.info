import { Metadata } from 'next'
import { ProductionTracker } from './tracker'

export const metadata: Metadata = {
  title: 'Production Tracker | adalia.info',
}

export default async function ProductionTrackerPage() {
  return (
    <div className='space-y-3 p-3'>
      <ProductionTracker />
    </div>
  )
}
