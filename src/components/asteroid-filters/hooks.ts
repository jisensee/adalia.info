import { useQueryStates } from 'nuqs'
import { TransitionStartFunction } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  AsteroidFilters,
  asteroidFilterParamsParsers,
  emptyAsteroidFilters,
} from './filter-params'
import { usePageParamCacheContext } from '@/context/page-param-cache'

export const useAsteroidFilters = (
  startTransition?: TransitionStartFunction
) => {
  const { updateCache } = usePageParamCacheContext()
  const [filters, setFilters] = useQueryStates(asteroidFilterParamsParsers, {
    shallow: false,
    startTransition,
  })

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

export const useAsteroidFilterNavigation = () => {
  const { updateCache } = usePageParamCacheContext()
  const [, setFilters] = useAsteroidFilters()
  const { push } = useRouter()
  const isAsteroidPage = usePathname() === '/asteroids'

  return (filters: Partial<AsteroidFilters>) => {
    if (isAsteroidPage) {
      setFilters({
        ...emptyAsteroidFilters,
        ...filters,
      })
    } else {
      updateCache({
        asteroidFilters: {
          ...emptyAsteroidFilters,
          ...filters,
        },
      })
      push('/asteroids')
    }
  }
}
