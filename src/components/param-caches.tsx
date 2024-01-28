'use client'

import { useAtom } from 'jotai'
import { FC, useEffect, useState } from 'react'
import { isPast } from 'date-fns'
import { useAsteroidFilters } from './asteroid-filters/hooks'
import { AsteroidFilters } from './asteroid-filters/filter-params'
import {
  asteroidColumnConfigAtom,
  lastAsteroidFiltersAtom,
  starkSightTokensAtom,
} from '@/hooks/atoms'
import { useAsteroidColumns } from '@/app/asteroids/hooks'
import { StarkSightTokenData } from '@/lib/starksight'

export const AsteroidColumnCache = () => {
  const [columnCache, setColumnCache] = useAtom(asteroidColumnConfigAtom)
  const [columns, setColumns] = useAsteroidColumns()

  useEffect(() => {
    if (columns && columns.length > 0) {
      setColumnCache(columns)
    } else {
      setColumns(columnCache)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(columnCache), JSON.stringify(columns)])

  return null
}

const filtersEmpty = (filters: AsteroidFilters) =>
  Object.values(filters).every((value) => value === null)

export const AsteroidFilterCache = () => {
  const [filters, setFilters] = useAsteroidFilters()
  const [lastFilters, setLastFilters] = useAtom(lastAsteroidFiltersAtom)
  const [initialized, setInitialized] = useState(false)

  const lastFilter = lastFilters[0]

  useEffect(() => {
    if (filters && !filtersEmpty(filters)) {
      setLastFilters([filters])
    } else if (lastFilter && !initialized) {
      setFilters(lastFilter)
    }
    if (!initialized) {
      setInitialized(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), JSON.stringify(lastFilter)])

  return null
}

type StarkSightCacheProps = {
  starkSightTokenData?: Omit<StarkSightTokenData, 'data'>
}
const isExpired = (tokenData: Omit<StarkSightTokenData, 'data'>) =>
  isPast(tokenData.expiration)

export const StarkSightCache: FC<StarkSightCacheProps> = ({
  starkSightTokenData,
}) => {
  const [, setTokens] = useAtom(starkSightTokensAtom)

  // Remove expired tokens every minute
  useEffect(() => {
    const interval = setInterval(
      () => setTokens((old) => old.filter((t) => !isExpired(t))),
      60_000
    )
    return () => clearInterval(interval)
  }, [setTokens])

  useEffect(() => {
    if (starkSightTokenData) {
      setTokens((old) => {
        const alreadyInCache = !!old.find(
          (t) => t.token === starkSightTokenData.token
        )
        if (alreadyInCache) {
          return old
            .map((t) =>
              t.token === starkSightTokenData.token ? starkSightTokenData : t
            )
            .filter((t) => !isExpired(t))
        } else {
          return [...old, starkSightTokenData].filter((t) => !isExpired(t))
        }
      })
    }
  }, [starkSightTokenData, setTokens])

  return null
}
