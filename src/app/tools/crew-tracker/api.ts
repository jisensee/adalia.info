import { Entity } from '@influenceth/sdk'
import { preReleaseInfluenceApi } from '@/lib/influence-api/api'
import { EntityIds, InfluenceEntity } from '@/lib/influence-api/types'

export type CrewStatusData = {
  id: number
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

          const asteroidId = entity.Location?.locations?.asteroid?.id

          const ship = entity.Location?.locations?.ship
          const building = entity.Location?.locations?.building
          const station = ship ?? building
          const actionLocation = await getCrewBusyLocation(entity)
          const habitat = station
            ? await preReleaseInfluenceApi.entity(station)
            : undefined

          return [
            {
              id: entity.id,
              name: entity.Name ?? `Crew #${entity.id}`,
              readyAt: new Date(entity.Crew.readyAt),
              actionLocation,
              habitat,
              roster: entity.Crew.roster,
              asteroidId,
              lotLocation: entity.Location?.locations.lot,
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
