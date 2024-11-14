import { A, D, pipe } from '@mobily/ts-belt'
import { isWithinInterval, min } from 'date-fns'
import { Entity } from '@influenceth/sdk'
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

export const calcParticipantScore = (
  race: Race,
  participant: Race['participants'][number]
) =>
  pipe(
    participant.transits,
    A.filter((t) =>
      isWithinInterval(t.arrival, {
        start: race.start,
        end: min([race.end, new Date()]),
      })
    ),
    A.map((t) => t.destination),
    A.uniq,
    A.length
  )

export const getShips = (race: Race) =>
  influenceApi
    .entities({
      label: Entity.IDS.SHIP,
      id: race.participants.map((p) => p.shipId),
    })
    .then((ships) => ships.map((s) => [s.id, s] as const))
    .then((s) => new Map(s))
