import { AsteroidFilters } from '@/components/asteroid-filters/filter-params'
import { Progress } from '@/components/ui/progress'
import { AsteroidService } from '@/server/asteroid-service'

export type ProgressChartsProps = {
  filters: AsteroidFilters
}

export const ProgressCharts = async ({ filters }: ProgressChartsProps) => {
  const { matchedCount, owned, scanned } =
    await AsteroidService.getProgressStats(filters)

  const ownedPercentage = (owned / matchedCount) * 100
  const scannedPercentage = (scanned / matchedCount) * 100

  return (
    <div className='flex flex-col gap-y-2'>
      <Progress className='h-10' value={ownedPercentage}>
        Owned {owned.toLocaleString()} / {matchedCount.toLocaleString()} (
        {ownedPercentage.toFixed(1)}%)
      </Progress>
      <Progress className='h-10' value={scannedPercentage}>
        Scanned {scanned.toLocaleString()} / {matchedCount.toLocaleString()} (
        {scannedPercentage.toFixed(1)}%)
      </Progress>
    </div>
  )
}
