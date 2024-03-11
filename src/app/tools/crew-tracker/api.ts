import { Entity } from '@influenceth/sdk'
import { preReleaseInfluenceApi } from '@/lib/influence-api'
import { EntityIds, InfluenceEntity } from '@/lib/influence-api-types'

export type CrewStatusData = {
  name: string
  readyAt: Date
  actionLocation?: InfluenceEntity
  habitat?: InfluenceEntity
  roster: number[]
  asteroidId?: number
  lotLocation?: EntityIds
}

export const getCrews = async (address: string): Promise<CrewStatusData[]> =>
  preReleaseInfluenceApi
    .entities({
      match: {
        path: 'Crew.delegatedTo',
        value: address.toLocaleLowerCase(),
      },
      label: Entity.IDS.CREW,
    })
    .then((crews) =>
      Promise.all(
        crews.flatMap(async (entity) => {
          if (!entity.Crew || entity.Crew.roster.length === 0) return []

          const asteroidId = entity.Location?.locations?.find(
            (l) => l.label === Entity.IDS.ASTEROID
          )?.id

          const ship = entity.Location?.locations?.find(
            (l) => l.label === Entity.IDS.SHIP
          )
          const building = entity.Location?.locations?.find(
            (l) => l.label === Entity.IDS.BUILDING
          )
          const station = ship ?? building
          const actionLocation = await getCrewBusyLocation(entity)
          const habitat = station
            ? await preReleaseInfluenceApi.entity(station)
            : undefined

          return [
            {
              name: entity.Name?.name ?? `Crew #${entity.id}`,
              readyAt: new Date(entity.Crew.readyAt),
              actionLocation,
              habitat,
              roster: entity.Crew.roster,
              asteroidId,
              lotLocation: entity.Location?.locations.find(
                (l) => l.label === Entity.IDS.LOT
              ),
            },
          ]
        })
      )
    )
    .then((e) => e.flat())

export const crewmateImageUrl = (crewmateId: number) =>
  `https://images-prerelease.influenceth.io/v1/crew/${crewmateId}/image.svg?bustOnly=true`

const getCrewBusyLocation = (entity: InfluenceEntity) => {
  if (entity.Crew?.actionTarget) {
    return preReleaseInfluenceApi.entity(entity.Crew.actionTarget)
  }
}
