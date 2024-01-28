import { useQueryStates } from 'nuqs'
import { TransitionStartFunction } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAtom } from 'jotai'
import {
  AsteroidFilters,
  asteroidFilterParamsParsers,
  emptyAsteroidFilters,
} from './filter-params'
import { lastAsteroidFiltersAtom } from '@/hooks/atoms'

export const useAsteroidFilters = (
  startTransition?: TransitionStartFunction
) => {
  const [filters, setFilters] = useQueryStates(asteroidFilterParamsParsers, {
    shallow: false,
    startTransition,
  })
  const [, setLastFilters] = useAtom(lastAsteroidFiltersAtom)

  const setFn = (newFilters: AsteroidFilters) => {
    setFilters(newFilters)
    if (filtersEmpty(newFilters)) {
      setLastFilters([{ ...emptyAsteroidFilters, ...newFilters }])
    }
  }

  return [filters, setFn] as const
}

export const useAsteroidFilterNavigation = () => {
  const [, setFilters] = useAsteroidFilters()
  const { push } = useRouter()
  const isAsteroidPage = usePathname() === '/asteroids'
  const [, setLastFilters] = useAtom(lastAsteroidFiltersAtom)

  return (filters: Partial<AsteroidFilters>) => {
    if (isAsteroidPage) {
      setFilters({
        ...emptyAsteroidFilters,
        ...filters,
      })
    } else {
      setLastFilters([{ ...emptyAsteroidFilters, ...filters }])
      push('/asteroids')
    }
  }
}

const filtersEmpty = (filters: Partial<AsteroidFilters>) =>
  Object.values(filters).every((value) => value === null)
