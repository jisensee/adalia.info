import { atomWithStorage } from 'jotai/utils'
import {
  AsteroidColumnConfig,
  defaultAsteroidColumnConfig,
} from '@/app/asteroids/types'
import { AsteroidFilters } from '@/components/asteroid-filters/filter-params'
import { StarkSightTokenData } from '@/lib/starksight'

export const lastAsteroidFiltersAtom = atomWithStorage<AsteroidFilters[]>(
  'asteroidFilters',
  [],
  undefined,
  {
    getOnInit: true,
  }
)
export const asteroidColumnConfigAtom = atomWithStorage<
  AsteroidColumnConfig[] | null
>('asteroidColumns', defaultAsteroidColumnConfig, undefined, {
  getOnInit: true,
})

export const starkSightTokensAtom = atomWithStorage<
  Omit<StarkSightTokenData, 'data'>[]
>('starkSightTokens', [], undefined, { getOnInit: true })
