import { RarityChart } from './rarity-chart'
import { SpectralTypesChart } from './spectral-types-chart'
import { ProgressCharts } from './progress-charts'
import { AsteroidFilterForm } from '@/components/asteroid-filters/asteroid-filter-form'
import { AsteroidFilterSummary } from '@/components/asteroid-filters/filter-summary'
import { AsteroidService } from '@/server/asteroid-service'
import { asteroidFiltersCache } from '@/components/asteroid-filters/filter-params'
import { FiltersDropdown } from '@/components/filters-dropdown'
import { fetchStarkSightTokenData } from '@/lib/starksight'
import { AsteroidFilterCache, StarkSightCache } from '@/components/param-caches'

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const filters = asteroidFiltersCache.parse(searchParams)
  const starkSightTokenData = filters.starksightToken
    ? await fetchStarkSightTokenData(filters.starksightToken.token)
    : undefined

  const [, groupedByRarity] = await AsteroidService.getGroupedByRarity(filters)
  const rarityData = groupedByRarity.flatMap((e) =>
    e.rarity
      ? [
          {
            rarity: e.rarity,
            count: e._count,
          },
        ]
      : []
  )

  const [, groupedBySpectralType] =
    await AsteroidService.getGroupedBySpectralType(filters)
  const spectralTypeData = groupedBySpectralType.map((e) => ({
    spectralType: e.spectralType,
    count: e._count,
  }))

  return (
    <div className='flex gap-x-2'>
      <AsteroidFilterForm />

      <StarkSightCache starkSightTokenData={starkSightTokenData} />
      <AsteroidFilterCache />

      <div className='flex w-full flex-col gap-y-3 p-3'>
        <div className='flex items-center justify-between'>
          <h1>Asteroid Stats</h1>
          <div>
            <FiltersDropdown />
          </div>
        </div>
        <AsteroidFilterSummary />
        <ProgressCharts filters={filters} />
        <div className='flex flex-wrap justify-center gap-5'>
          <RarityChart data={rarityData} />
          <SpectralTypesChart data={spectralTypeData} />
        </div>
      </div>
    </div>
  )
}
