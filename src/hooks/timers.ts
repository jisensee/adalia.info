import { differenceInSeconds } from 'date-fns'
import { useEffect, useState } from 'react'

export const useRemainingSeconds = (
  finishTime: Date,
  updateInterval = 10_000
) => {
  const [remainingSeconds, setRemainingSeconds] = useState(
    differenceInSeconds(finishTime, new Date())
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = differenceInSeconds(finishTime, new Date())
      setRemainingSeconds(diff < 0 ? 0 : diff)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [finishTime, updateInterval])

  return remainingSeconds
}
