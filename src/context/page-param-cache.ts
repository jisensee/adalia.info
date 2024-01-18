'use client'

import { createContext, useContext } from 'react'
import { AsteroidColumnConfig } from '@/app/asteroids/types'
import { AsteroidFilters } from '@/components/asteroid-filters/filter-params'

export type PageParamCache = {
  asteroidFilters: AsteroidFilters | null
  asteroidColumnConfig: AsteroidColumnConfig[] | null
}

type PageParamCacheContext = {
  cache: PageParamCache
  updateCache: (cache: Partial<PageParamCache>) => void
}

const context = createContext<PageParamCacheContext>({
  cache: {
    asteroidFilters: null,
    asteroidColumnConfig: null,
  },
  updateCache: () => {},
})

export const usePageParamCacheContext = () => useContext(context)
export const PageParamCacheProvider = context.Provider
