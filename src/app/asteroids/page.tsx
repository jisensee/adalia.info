import { AsteroidTable } from './table'
import { asteroidPageParamsCache } from './types'
import { Paginator } from './paginator'
import { ColumnConfig } from './column-config'
import { Export } from './export'
import { AsteroidFilterForm } from '@/components/asteroid-filters/asteroid-filter-form'
import { AsteroidFilterSummary } from '@/components/asteroid-filters/filter-summary'
import { AsteroidService } from '@/server/asteroid-service'
import { asteroidFiltersCache } from '@/components/asteroid-filters/filter-params'

export default async function Asteroids({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const params = asteroidPageParamsCache.parse(searchParams)
  const filters = asteroidFiltersCache.parse(searchParams)

  const [totalCount, asteroids] = await AsteroidService.getPage(
    params.page,
    params.pageSize,
    filters,
    params.sort
  )
  const totalPages = Math.ceil(totalCount / params.pageSize)

  const tableHeader = (
    <div className='flex flex-row items-center justify-between'>
      <h2>{totalCount.toLocaleString()} Asteroids</h2>
      <div className='flex flex-row gap-x-2'>
        <Export totalCount={totalCount} />
        <ColumnConfig />
      </div>
    </div>
  )

  return (
    <div className='flex flex-row gap-x-2'>
      <AsteroidFilterForm />
      <div className='flex w-full flex-grow flex-col gap-y-2 overflow-y-auto p-3'>
        <h1>Asteroids</h1>
        <p>
          Select your filters in the sidebar and copy the URL to share your
          current filter and sorting setup.
        </p>
        <AsteroidFilterSummary />
        {tableHeader}
        <AsteroidTable data={asteroids} />
        <Paginator totalPages={totalPages} />
      </div>
    </div>
  )
}
