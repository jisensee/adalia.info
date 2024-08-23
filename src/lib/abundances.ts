import { Asteroid } from '@influenceth/sdk'
import { A, D, N, pipe } from '@mobily/ts-belt'

export type LotAbundances = {
  lotIndex: number
  summedAbundances: number
  resources: Record<number, number>
}

export type CalcLotAbundancesArgs = {
  asteroidId: number
  lotCount: number
  abundances: string
  availableResources: number[]
}

export const calcLotAbundances = (
  {
    asteroidId,
    lotCount,
    abundances,
    availableResources,
  }: CalcLotAbundancesArgs,
  onProgress?: (progress: number) => void
) => {
  const settings = new Map(
    availableResources.map(
      (resource) =>
        [
          resource,
          Asteroid.getAbundanceMapSettings(asteroidId, resource, abundances),
        ] as const
    )
  )

  const getLotAbundances = (lotIndex: number): LotAbundances => {
    const lotPosition = Asteroid.getLotPosition(asteroidId, lotIndex)
    const abundances = pipe(
      availableResources,
      A.map((resource) => {
        const abundance = Asteroid.getAbundanceAtPosition(
          lotPosition,
          settings.get(resource)
        )
        return [resource, abundance] as const
      }),
      D.fromPairs
    )
    const summedAbundances = pipe(
      abundances,
      D.values,
      A.filter(N.gt(0.1)),
      A.reduce(0, N.add)
    )
    return { lotIndex, summedAbundances, resources: abundances }
  }
  return pipe(
    A.range(1, lotCount),
    A.map((lotIndex) => {
      onProgress?.((lotIndex / lotCount) * 100)
      return getLotAbundances(lotIndex)
    })
  )
}
