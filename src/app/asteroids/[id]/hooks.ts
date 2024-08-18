import { Asteroid } from '@influenceth/sdk'
import { A, D, N, pipe } from '@mobily/ts-belt'
import { useQuery } from '@tanstack/react-query'

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
) =>
  useQuery({
    queryKey: ['asteroidAbundances', asteroidId],
    enabled: false,
    queryFn: () => {
      if (!availableResources || !abundances) return
      const settings = new Map(
        availableResources.map(
          (resource) =>
            [
              resource,
              Asteroid.getAbundanceMapSettings(
                asteroidId,
                resource,
                abundances
              ),
            ] as const
        )
      )

      const getLotAbundances = (lotIndex: number): LotAbundances => {
        const lotPosition = Asteroid.getLotPosition(asteroidId, lotIndex)
        const abundances = pipe(
          availableResources,
          A.map(
            (resource) =>
              [
                resource,
                Asteroid.getAbundanceAtPosition(
                  lotPosition,
                  settings.get(resource)
                ),
              ] as const
          ),
          D.fromPairs
        )
        const summedAbundances = pipe(
          abundances,
          D.values,
          A.filter(N.gt(0.1)),
          A.reduce(0, N.add)
        )
        return { lotIndex, summedAbundances, ...abundances }
      }
      return pipe(
        A.range(1, lotCount),
        A.map((lotIndex) => getLotAbundances(lotIndex))
      )
    },
  })
