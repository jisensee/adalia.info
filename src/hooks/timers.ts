import { differenceInSeconds } from 'date-fns'
import { useRouter } from 'next/navigation'
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

export const useNow = (updateInterval = 10_000) => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, updateInterval)

    return () => clearInterval(interval)
  }, [updateInterval])

  return now
}

export const usePeriodicRefresh = (interval = 60_000) => {
  const { refresh } = useRouter()

  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh()
    }, interval)

    return () => clearInterval(intervalId)
  }, [refresh, interval])
}

export const useRefreshTimer = (
  intervalInSeconds: number,
  onRefresh: () => void
) => {
  const [remainingSeconds, setRemainingSeconds] = useState(intervalInSeconds)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingSeconds((old) => old - 1)
    }, 1_000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (remainingSeconds === 0) {
      onRefresh()
      setRemainingSeconds(intervalInSeconds)
    }
  }, [remainingSeconds, intervalInSeconds, onRefresh])

  return remainingSeconds
}
