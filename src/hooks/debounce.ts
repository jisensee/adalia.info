import { F } from '@mobily/ts-belt'
import { useEffect, useMemo, useState } from 'react'

export const useDebouncedState = <T>(state: T, msDelay: number) => {
  const [debouncedState, setDebouncedState] = useState(state)
  const setDebounced = useMemo(
    () => F.debounce((s: T) => setDebouncedState(s), msDelay),
    [setDebouncedState, msDelay]
  )

  useEffect(() => {
    setDebounced(state)
  }, [state, setDebounced])

  return debouncedState
}
