'use client'

import { usePeriodicRefresh } from '@/hooks/timers'

export const Refresh = () => {
  usePeriodicRefresh()
  return null
}
