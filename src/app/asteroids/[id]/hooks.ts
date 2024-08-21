import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { F } from '@mobily/ts-belt'
import { CalcLotAbundancesArgs } from '@/lib/abundances'

export type LotAbundances = {
  lotIndex: number
  summedAbundances: number
  [resource: number]: number
}

export const useAsteroidAbundances = (
  asteroidId: number,
  lotCount: number,
  abundances?: string,
  availableResources?: number[]
) => {
  const [progress, setProgress] = useState(0)
  const worker = useRef<Worker>()

  useEffect(() => {
    worker.current = new Worker(
      new URL('./abundances-worker.ts', import.meta.url)
    )
    return () => {
      worker.current?.terminate()
      worker.current = undefined
    }
  }, [])
  const result = useQuery({
    queryKey: ['asteroidAbundances', asteroidId],
    enabled: false,
    queryFn: () =>
      new Promise<LotAbundances[]>((resolve, reject) => {
        const updateProgress = F.throttle(setProgress, 250)
        if (!availableResources || !abundances || !worker.current) {
          reject()
          return
        }

        const args: CalcLotAbundancesArgs = {
          asteroidId,
          lotCount,
          abundances,
          availableResources,
        }
        worker.current.onmessage = ({ data }) => {
          switch (data.type) {
            case 'result':
              resolve(data.abundances)
              break
            case 'progress':
              updateProgress(data.progress)
              break
          }
        }
        worker.current.postMessage(args)
      }),
  })

  return { ...result, progress }
}
