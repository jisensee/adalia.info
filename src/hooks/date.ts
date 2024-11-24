import { useEffect, useState } from 'react'

export const useLocalDate = (utcDate: Date) => {
  const [date, setDate] = useState(utcDate)

  useEffect(() => {
    setDate(utcDate)
  }, [utcDate])

  return date
}
