import { useQueryStates } from 'next-usequerystate'
import { TransitionStartFunction, useEffect } from 'react'
import { AsteroidFilters, asteroidFilterParamsParsers } from './filter-params'
import { usePageParamCacheContext } from '@/context/page-param-cache'

const filtersEmpty = (filters: AsteroidFilters) =>
  Object.values(filters).every((value) => value === null)

export const useAsteroidFilters = (
  startTransition?: TransitionStartFunction
) => {
  const { cache, updateCache } = usePageParamCacheContext()
  const [filters, setFilters] = useQueryStates(asteroidFilterParamsParsers, {
    shallow: false,
    startTransition,
  })

  useEffect(() => {
    if (cache.asteroidFilters === null) {
      updateCache({
        asteroidFilters: filters,
      })
    } else if (filtersEmpty(filters)) {
      setFilters(cache.asteroidFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [
    filters,
    (newFilters: Partial<AsteroidFilters>) => {
      updateCache({
        asteroidFilters: { ...filters, ...newFilters },
      })
      setFilters(newFilters)
    },
  ] as const
}
