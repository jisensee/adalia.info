import {
  Asteroid,
  Building,
  Entity,
  Permission,
  Processor,
} from '@influenceth/sdk'
import esb from 'elastic-builder'
import {
  InfluenceEntity,
  entitySchema,
  getEntityName,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import { O, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api/api'

export type PublicBuilding = Awaited<
  ReturnType<typeof getPublicBuildings>
>['buildings'][number]

export const getPublicBuildings = async (
  buildingType: number,
  asteroidId: number,
  habitatLotIndex: number | null
) => {
  const buildings = await influenceApi.search({
    index: 'building',
    request: esb
      .requestBodySearch()
      .query(
        esb
          .boolQuery()
          .must([
            esb.nestedQuery(
              esb
                .boolQuery()
                .must([
                  esb.termQuery(
                    'Location.locations.label',
                    Entity.IDS.ASTEROID
                  ),
                  esb.termQuery('Location.locations.id', asteroidId),
                ]),
              'Location.locations'
            ),
            esb.termQuery('Building.buildingType', buildingType),
            esb
              .boolQuery()
              .should([
                esb.nestedQuery(
                  esb
                    .boolQuery()
                    .must([
                      esb.termsQuery(
                        'PublicPolicies.permission',
                        getPermissions(buildingType)
                      ),
                      esb.termQuery('PublicPolicies.public', true),
                    ]),
                  'PublicPolicies'
                ),
                esb.nestedQuery(
                  esb.termsQuery(
                    'PrepaidPolicies.permission',
                    getPermissions(buildingType)
                  ),
                  'PrepaidPolicies'
                ),
              ]),
          ])
      )
      .size(999),
    options: {
      responseSchema: searchResponseSchema(entitySchema),
    },
  })
  const getFinishTimes = (building: InfluenceEntity) => {
    if (building.Building?.buildingType === Building.IDS.EXTRACTOR) {
      return {
        type: 'extractor' as const,
        permission: Permission.IDS.EXTRACT_RESOURCES as number,
        processFinishTime: building.Extractors[0]?.finishTimestamp,
      }
    } else if (building.Building?.buildingType === Building.IDS.SHIPYARD) {
      const processFinishTime = building.Processors.find(
        (p) => p.processorType === Processor.IDS.SHIPYARD
      )?.finishTimestamp
      const assembleShipFinishTime = building.Processors.find(
        (p) => p.processorType === Processor.IDS.DRY_DOCK
      )?.finishTimestamp
      return {
        type: 'shipyard' as const,
        processFinishTime,
        assembleShipFinishTime,
      }
    }
    return {
      type: 'other' as const,
      permission: Permission.IDS.RUN_PROCESS,
      processFinishTime: building.Processors[0]?.finishTimestamp,
    }
  }

  const total = buildings.hits.total
  return {
    total,
    buildings: buildings.hits.hits.map(({ _source: building }) => {
      const buildingLot = building.Location?.resolvedLocations?.lot
      return {
        name: getEntityName(building),
        isPublic: building.PublicPolicies.some((p) => p.public),
        finishTimes: getFinishTimes(building),
        prepaidPolicies: building.PrepaidPolicies.map((policy) => ({
          swayPerDay: Math.round(policy.rate / 41_666),
          daysNotice: policy.noticePeriod / 86_400,
          minimumDays: policy.initialTerm / 86_400,
          permission: policy.permission,
        })),
        lotUuid: buildingLot?.uuid ?? '',
        habitatDistance: pipe(
          habitatLotIndex ?? undefined,
          O.zip(buildingLot?.lotIndex),
          O.map(([origin, destination]) =>
            Asteroid.getLotDistance(asteroidId, origin, destination)
          )
        ),
      }
    }),
  }
}

const getPermissions = (buildingType: number) => {
  switch (buildingType) {
    case Building.IDS.BIOREACTOR:
    case Building.IDS.FACTORY:
    case Building.IDS.REFINERY:
      return [Permission.IDS.RUN_PROCESS]
    case Building.IDS.SHIPYARD:
      return [Permission.IDS.RUN_PROCESS, Permission.IDS.ASSEMBLE_SHIP]
    case Building.IDS.EXTRACTOR:
      return [Permission.IDS.EXTRACT_RESOURCES]
  }
  return []
}
