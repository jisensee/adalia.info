'use server'

import { randomUUID } from 'crypto'
import { Building } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { A, flow } from '@mobily/ts-belt'
import { Trip } from './params'
import { db } from '@/server/db'
import { getOrbits } from '@/actions/asteroids'

export type ResolvedTrip = {
  id: string
  origin: InfluenceEntity
  destination: InfluenceEntity
}

export const resolveTrips = async (trips: Trip[]) => {
  const asteroidIds = trips.flatMap((t) => [t.origin, t.destination])
  const asteroids = await getOrbits(asteroidIds).then(
    flow(
      A.map((a) => [a.id, a] as const),
      (a) => new Map(a)
    )
  )

  return A.filterMap(trips, (trip) => {
    const origin = asteroids.get(trip.origin)
    const destination = asteroids.get(trip.destination)
    if (!origin || !destination) return
    return {
      id: randomUUID(),
      origin,
      destination,
    } satisfies ResolvedTrip
  })
}

export const getMatchingOrbits = async (
  originId: number,
  requiredBuildings: number[]
) =>
  db.asteroid
    .findMany({
      where: {
        id: { not: originId },
        totalBuildings: { gt: 0 },
        habitats: requiredBuildings.includes(Building.IDS.HABITAT)
          ? { gt: 0 }
          : undefined,
        marketplaces: requiredBuildings.includes(Building.IDS.MARKETPLACE)
          ? { gt: 0 }
          : undefined,
        spaceports: requiredBuildings.includes(Building.IDS.SPACEPORT)
          ? { gt: 0 }
          : undefined,
      },
      select: {
        id: true,
      },
    })
    .then((d) => d.map((a) => a.id))
    .then(getOrbits)
