import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
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
  return useQuery({
    queryKey: ['asteroidAbundances', asteroidId],
    enabled: false,
    queryFn: () =>
      new Promise<LotAbundances[]>((resolve, reject) => {
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
        worker.current.onmessage = (e) => resolve(e.data)
        worker.current.postMessage(args)
      }),
  })
}
