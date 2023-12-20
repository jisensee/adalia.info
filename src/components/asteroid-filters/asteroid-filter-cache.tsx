'use client'

import { useEffect } from 'react'
import { AsteroidFilters } from './filter-params'
import { useAsteroidFilters } from './hooks'
import { usePageParamCacheContext } from '@/context/page-param-cache'

const filtersEmpty = (filters: AsteroidFilters) =>
  Object.values(filters).every((value) => value === null)

export const AsteroidFilterCache = () => {
  const { cache, updateCache } = usePageParamCacheContext()

  const [filters, setFilters] = useAsteroidFilters()

  useEffect(() => {
    if (filtersEmpty(filters) && cache.asteroidFilters) {
      setFilters(cache.asteroidFilters)
    } else {
      updateCache({
        asteroidFilters: filters,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
