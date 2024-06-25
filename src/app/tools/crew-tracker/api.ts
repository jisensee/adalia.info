import { Entity } from '@influenceth/sdk'
import { EntityIds, InfluenceEntity } from 'influence-typed-sdk/api'
import { influenceApi } from '@/lib/influence-api/api'

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
  influenceApi
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
            ? await influenceApi.entity(station)
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

const getCrewBusyLocation = (entity: InfluenceEntity) => {
  if (entity.Crew?.actionTarget) {
    return influenceApi.entity(entity.Crew.actionTarget)
  }
}
