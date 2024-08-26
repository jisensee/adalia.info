import { getExpiringLots } from './api'
import { expiringLotswParamsCache } from './params'
import { ExpiringLotsTable } from './table'

export default async function ExpiringLotsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const params = expiringLotswParamsCache.parse(searchParams)
  const lots = await getExpiringLots(params)
  return (
    <div className='space-y-3 p-3'>
      <h1>{lots.length} lots expiring in the next 48 hours</h1>
      <ExpiringLotsTable lots={lots} />
    </div>
  )
}
