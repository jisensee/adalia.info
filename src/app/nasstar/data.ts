import { A, D, F, O, pipe } from '@mobily/ts-belt'
import { isBefore, isWithinInterval, min } from 'date-fns'
import { Entity } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { db } from '@/server/db'
import { influenceApi } from '@/lib/influence-api/api'

export const getRace = async () => {
  const include = {
    participants: {
      include: {
        transits: true,
      },
    },
  }

  const ongoing = await db.shipRace.findFirst({
    where: {
      start: { lte: new Date() },
      end: {
        gte: new Date(),
      },
    },
    include,
  })

  if (ongoing) return ongoing

  const upcoming = await db.shipRace.findFirst({
    where: {
      start: { gte: new Date() },
    },
    include,
    orderBy: {
      start: 'asc',
    },
  })

  if (upcoming) return upcoming

  const previous = await db.shipRace.findFirst({
    where: {
      end: { lt: new Date() },
    },
    include,
    orderBy: {
      end: 'desc',
    },
  })

  return previous
}

export type Race = NonNullable<Awaited<ReturnType<typeof getRace>>>

export const calcLeaderboard = (race: Race) =>
  pipe(
    race.participants,
    A.map((p) => ({ score: calcParticipantScore(race, p), ...p })),
    A.sort((a, b) => {
      if (a.score === b.score) {
        const lastA = getLastTransit(race, a)
        const lastB = getLastTransit(race, b)
        return (
          (lastB?.arrival?.getTime() ?? 0) - (lastA?.arrival?.getTime() ?? 0)
        )
      }
      return a.score - b.score
    }),
    A.reverse
  )

const getLastTransit = (
  race: Race,
  participant: Race['participants'][number]
) =>
  pipe(
    participant.transits,
    A.filter((t) => isTransitInRace(race, t.arrival)),
    A.sortBy(D.prop('arrival')),
    A.filter(
      (transit) =>
        !A.any(
          participant.transits,
          (t) =>
            t.destination === transit.destination &&
            isBefore(t.arrival, transit.arrival)
        )
    ),
    A.last
  )

export const isTransitInRace = (race: Race, arrival: Date) =>
  isWithinInterval(arrival, {
    start: race.start,
    end: min([race.end, new Date()]),
  })

export const calcParticipantScore = (
  race: Race,
  participant: Race['participants'][number]
) =>
  pipe(
    participant.transits,
    A.filter((t) => isTransitInRace(race, t.arrival)),
    A.reject((t) => t.destination === getInitialAsteroid(race, participant)),
    A.map((t) => t.destination),
    A.uniq,
    A.length
  )

const getInitialAsteroid = (
  race: Race,
  participant: Race['participants'][number]
) =>
  pipe(
    A.filter(participant.transits, (t) => isTransitInRace(race, t.arrival)),
    A.sortBy(D.prop('arrival')),
    A.head,
    O.map(D.prop('origin'))
  )

export const getShips = (race: Race) =>
  influenceApi
    .entities({
      label: Entity.IDS.SHIP,
      id: race.participants.map((p) => p.shipId),
    })
    .then((ships) => ships.map((s) => [s.id, s] as const))
    .then((s) => new Map(s))

export const getTotalVisitedAsteroids = (race: Race) =>
  pipe(
    race.participants,
    A.map((p) => p.transits.map((t) => t.destination)),
    A.flat,
    A.groupBy(F.identity),
    D.toPairs,
    A.map(([asteroid, visits]) => ({
      asteroid: parseInt(asteroid),
      visits: visits?.length ?? 0,
      visitors: pipe(
        race.participants,
        A.filter((p) =>
          p.transits.some((t) => t.destination === parseInt(asteroid))
        ),
        A.length
      ),
    })),
    A.sortBy((e) => -e.visits)
  )

export const getLeaderboard = (
  race: Race,
  shipMap: Map<number, InfluenceEntity>
) =>
  pipe(
    race,
    calcLeaderboard,
    A.filterMap((p) => O.map(shipMap.get(p.shipId), (ship) => ({ ...p, ship })))
  )
