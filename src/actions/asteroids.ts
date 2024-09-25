'use server'
import { Address, Building, Entity } from '@influenceth/sdk'
import { A, D, flow } from '@mobily/ts-belt'
import {
  entitySchema,
  getEntityName,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import esb from 'elastic-builder'
import { z } from 'zod'
import { db } from '@/server/db'
import { influenceApi } from '@/lib/influence-api/api'

export const getAsteroidCount = async (address: string) =>
  db.asteroid.count({
    where: { ownerAddress: Address.toStandard(address) },
  })

export const searchAsteroid = (search: string) =>
  search.length === 0
    ? influenceApi.util
        .asteroidPage({
          size: 10,
        })
        .then((r) => r.asteroids)
    : influenceApi.util
        .asteroidSearch(search)
        .then(
          flow(
            (res) => res.hits.hits,
            A.sortBy(D.prop('_score')),
            A.reverse,
            A.map(D.prop('_source'))
          )
        )

export const getAsteroidName = (asteroidId: number) =>
  influenceApi
    .entity({
      id: asteroidId,
      label: Entity.IDS.ASTEROID,
    })
    .then(getEntityName)

export const asteroidBuildings = async (asteroidIds: number[]) => {
  const result = await influenceApi.search({
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
                  esb.termsQuery('Location.locations.id', asteroidIds),
                ]),
              'Location.locations'
            ),
            esb.termQuery(
              'Building.status',
              Building.CONSTRUCTION_STATUSES.OPERATIONAL
            ),
          ])
      )
      .size(0)
      .agg(
        esb
          .termsAggregation('buildingType', 'Building.buildingType')
          .agg(
            esb
              .nestedAggregation('location', 'Location.locations')
              .agg(
                esb
                  .filterAggregation(
                    'asteroid',
                    esb.termQuery(
                      'Location.locations.label',
                      Entity.IDS.ASTEROID
                    )
                  )
                  .agg(
                    esb.termsAggregation(
                      'asteroidBuildings',
                      'Location.locations.id'
                    )
                  )
              )
          )
      )
      .size(asteroidIds.length),
    options: {
      responseSchema: z
        .object({
          aggregations: z.object({
            buildingType: z.object({
              buckets: z.array(
                z.object({
                  key: z.number(),
                  location: z.object({
                    asteroid: z.object({
                      asteroidBuildings: z.object({
                        buckets: z.array(
                          z.object({
                            key: z.number(),
                            doc_count: z.number(),
                          })
                        ),
                      }),
                    }),
                  }),
                })
              ),
            }),
          }),
        })
        .transform((r) => {
          const map: Record<number, Record<number, number>> = {}
          r.aggregations.buildingType.buckets.forEach(
            ({ key: buildingType, location }) =>
              location.asteroid.asteroidBuildings.buckets.forEach(
                ({ key: asteroidId, doc_count: buildingCount }) => {
                  const asteroidBuildings = map[asteroidId]
                  if (asteroidBuildings) {
                    asteroidBuildings[buildingType] = buildingCount
                  } else {
                    map[asteroidId] = { [buildingType]: buildingCount }
                  }
                }
              )
          )
          return map
        }),
    },
  })

  return result
}

export const getOrbits = (asteroids: number[]) =>
  influenceApi
    .search({
      index: 'asteroid',
      request: esb
        .requestBodySearch()
        .query(esb.termsQuery('id', asteroids))
        .source(['id', 'label', 'Name', 'Orbit', 'Celestial'])
        .size(asteroids.length),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((r) => r.hits.hits)
