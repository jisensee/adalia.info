import { A, D, O, pipe } from '@mobily/ts-belt'
import { isWithinInterval, min } from 'date-fns'
import { Entity } from '@influenceth/sdk'
import { InfluenceEntity } from 'influence-typed-sdk/api'
import { db } from '@/server/db'
import { influenceApi } from '@/lib/influence-api/api'

export const getRace = () =>
  db.shipRace.findFirst({
    where: {
      end: {
        gte: new Date(),
      },
    },
    include: {
      participants: {
        include: {
          transits: true,
        },
      },
    },
    orderBy: {
      start: 'asc',
    },
  })

export type Race = NonNullable<Awaited<ReturnType<typeof getRace>>>

export const calcLeaderboard = (race: Race) =>
  pipe(
    race.participants,
    A.map((p) => ({ score: calcParticipantScore(race, p), ...p })),
    A.sortBy((p) =>
      pipe(
        p.transits,
        A.sortBy(D.prop('arrival')),
        A.head,
        (lastTransit) =>
          p.score + (lastTransit ? 1 / lastTransit.arrival.getTime() : 0)
      )
    ),
    A.reverse
  )

const isTransitInRace = (race: Race, arrival: Date) =>
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

export const getLeaderboard = (
  race: Race,
  shipMap: Map<number, InfluenceEntity>
) =>
  pipe(
    race,
    calcLeaderboard,
    A.filterMap((p) => O.map(shipMap.get(p.shipId), (ship) => ({ ...p, ship })))
  )
