import { parseAsArrayOf, parseAsJson } from 'nuqs/server'
import { useQueryState } from 'nuqs'
import { AsteroidColumnConfig } from './types'

export const useAsteroidColumns = () => {
  const [columns, setColumns] = useQueryState(
    'columns',
    parseAsArrayOf(parseAsJson<AsteroidColumnConfig>())
  )
  return [columns ?? [], setColumns] as const
}
