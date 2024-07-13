import {
  EntityIds,
  InfluenceEntity,
  getEntityName,
} from 'influence-typed-sdk/api'
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
  influenceApi.util
    .crews(address)
    .then((crews) =>
      Promise.all(
        crews.flatMap(async (entity) => {
          if (!entity.Crew || entity.Crew.roster.length === 0) return []

          const asteroidId = entity.Location?.resolvedLocations?.asteroid?.id

          const ship = entity.Location?.resolvedLocations?.ship
          const building = entity.Location?.resolvedLocations?.building
          const station = ship ?? building
          const actionLocation = await getCrewBusyLocation(entity)
          const habitat = station
            ? await influenceApi.entity(station)
            : undefined

          return [
            {
              id: entity.id,
              name: getEntityName(entity),
              readyAt: entity.Crew.readyAtTimestamp,
              actionLocation,
              habitat,
              roster: entity.Crew.roster,
              asteroidId,
              lotLocation: entity.Location?.resolvedLocations.lot,
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
