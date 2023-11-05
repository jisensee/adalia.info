import { decodeQueryParams } from 'serialize-query-params'
import { AsteroidTable } from './table'
import { asteroidsPageParamConfig, defaultAsteroidColumnConfig } from './types'
import { Paginator } from './paginator'
import { ColumnConfig } from './column-config'
import { Export } from './export'
import { AsteroidFilterForm } from '@/components/asteroid-filters/asteroid-filter-form'
import { AsteroidFilterSummary } from '@/components/asteroid-filters/filter-summary'
import { AsteroidService } from '@/server/asteroid-service'

export default async function Asteroids({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const params = decodeQueryParams(asteroidsPageParamConfig, searchParams)
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 15

  const [totalCount, asteroids] = await AsteroidService.getPage(
    page,
    pageSize,
    params
  )
  const totalPages = Math.ceil(totalCount / pageSize)

  const tableHeader = (
    <div className='flex flex-row items-center justify-between'>
      <h2>{totalCount.toLocaleString()} Asteroids</h2>
      <div className='flex flex-row gap-x-2'>
        <Export searchParams={searchParams} totalCount={totalCount} />
        <ColumnConfig params={params} />
      </div>
    </div>
  )

  return (
    <div className='flex h-full flex-row gap-x-2 overflow-y-hidden'>
      <AsteroidFilterForm searchParams={searchParams} />
      <div className='flex w-full flex-grow flex-col gap-y-2 overflow-y-auto p-3'>
        <h1>Asteroids</h1>
        <p>
          Select your filters in the sidebar and copy the URL to share your
          current filter and sorting setup.
        </p>
        <AsteroidFilterSummary searchParams={searchParams} />
        {tableHeader}
        <AsteroidTable
          columns={params.columns ?? defaultAsteroidColumnConfig}
          data={asteroids}
          pageParams={params}
        />
        <Paginator params={params} totalPages={totalPages} />
      </div>
    </div>
  )
}
