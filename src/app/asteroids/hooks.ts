import { parseAsArrayOf, parseAsJson } from 'next-usequerystate/parsers'
import { useQueryState } from 'next-usequerystate'
import { useEffect } from 'react'
import { AsteroidColumnConfig, defaultAsteroidColumnConfig } from './types'
import { usePageParamCacheContext } from '@/context/page-param-cache'

export const useAsteroidColumns = () => {
  const { cache, updateCache } = usePageParamCacheContext()

  const [columns, setColumns] = useQueryState(
    'columns',
    parseAsArrayOf(parseAsJson<AsteroidColumnConfig>()).withDefault(
      defaultAsteroidColumnConfig
    )
  )
  useEffect(() => {
    if (cache.asteroidColumnConfig === null) {
      updateCache({
        asteroidColumnConfig: columns,
      })
    } else {
      setColumns(cache.asteroidColumnConfig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [
    columns,
    (newColumns: AsteroidColumnConfig[]) => {
      updateCache({
        asteroidColumnConfig: newColumns,
      })
      setColumns(newColumns)
    },
  ] as const
}
