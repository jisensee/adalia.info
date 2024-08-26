import {
  entitySchema,
  InfluenceEntity,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import esb from 'elastic-builder'
import { Address, Entity, Permission } from '@influenceth/sdk'
import { A, D, flow, pipe } from '@mobily/ts-belt'
import { ExpiringLotsParams } from './params'
import { influenceApi } from '@/lib/influence-api/api'

export type ExpiringLot = {
  lotUuid: string
  asteroidId: number
  asteroidName: string
  endTime: Date
  building: InfluenceEntity
  crew: InfluenceEntity
}

export const getExpiringLots = ({
  asteroidId,
  deduplicateOwners,
  owner,
  buildingType,
}: ExpiringLotsParams) =>
  influenceApi
    .search({
      index: 'lot',
      request: esb
        .requestBodySearch()
        .query(
          esb.boolQuery().must([
            esb.nestedQuery(
              esb
                .rangeQuery('PrepaidAgreements.endTime')
                .gt(Math.round(new Date().getTime() / 1_000))
                .lt(Math.round(new Date().getTime() / 1_000 + 3_600 * 48)),
              'PrepaidAgreements'
            ),
            ...(asteroidId
              ? [
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
                ]
              : []),
          ])
        )
        .size(9999),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((result) =>
      A.filterMap(result.hits.hits, ({ _source: lot }) => {
        const agreement = lot.PrepaidAgreements?.find(
          (a) => a.permission === Permission.IDS.USE_LOT
        )
        const crewId = agreement?.permitted?.id
        const endTime = agreement?.endTimestamp
        const lotUuid = lot.uuid
        const asteroidId = lot.Location?.resolvedLocation?.asteroid?.id
        if (!lotUuid || !asteroidId || !endTime || !crewId) return

        return {
          asteroidId,
          lotUuid,
          endTime,
          crewId,
        }
      })
    )
    .then(async (lots) => {
      const [asteroidNames, buildings, crews] = await Promise.all([
        influenceApi.util.asteroidNames(
          pipe(lots, A.map(D.prop('asteroidId')), A.uniq)
        ),
        getBuildings(pipe(lots, A.map(D.prop('lotUuid')))),
        getCrews(pipe(lots, A.map(D.prop('crewId')), A.uniq)),
      ])

      const expiringLeases = A.filterMap(lots, (lot) => {
        const building = buildings.get(lot.lotUuid)
        const asteroidName = asteroidNames.get(lot.asteroidId)
        const crew = crews.get(lot.crewId)
        const crewMatchesFilter =
          !owner || crew?.Crew?.delegatedTo === Address.toStandard(owner)
        const buildingMatchesFilter =
          !buildingType || building?.Building?.buildingType === buildingType
        if (
          !building ||
          !asteroidName ||
          !crew ||
          !crewMatchesFilter ||
          !buildingMatchesFilter
        )
          return

        return {
          ...lot,
          asteroidName,
          building,
          crew,
        } satisfies ExpiringLot
      })
      if (deduplicateOwners) {
        return A.uniqBy(expiringLeases, (l) => l.crew.Crew?.delegatedTo)
      }

      return expiringLeases
    })

const getCrews = async (crewIds: number[]) =>
  influenceApi
    .entities({
      id: crewIds,
      label: Entity.IDS.CREW,
    })
    .then(
      flow(
        A.map((c) => [c.id, c] as const),
        (c) => new Map(c)
      )
    )

const getBuildings = (lotUuids: string[]) =>
  influenceApi
    .search({
      index: 'building',
      request: esb
        .requestBodySearch()
        .query(
          esb.nestedQuery(
            esb
              .boolQuery()
              .must([
                esb.termQuery('Location.locations.label', Entity.IDS.LOT),
                esb.termsQuery('Location.locations.uuid', lotUuids),
              ]),
            'Location.locations'
          )
        )

        .size(9999),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((result) =>
      pipe(
        result.hits.hits,
        A.filterMap(({ _source: building }) => {
          const lotUuid = building.Location?.resolvedLocation?.lot?.uuid
          if (!lotUuid) return
          return [lotUuid, building] as const
        }),
        (b) => new Map(b)
      )
    )
