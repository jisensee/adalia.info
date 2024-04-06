import { z } from 'zod'

import esb from 'elastic-builder'
import { Building, Entity } from '@influenceth/sdk'
import { RawRequest } from './raw-request'
import { makeSearch } from './search'
import { makeEntities } from './entity'
import { entitySchema, searchResponseSchema } from './types'

export const makeUtils = (rawRequest: RawRequest) => ({
  floorPrices: makeFloorPrices(rawRequest),
  asteroidNames: makeAsteroidNames(rawRequest),
  buildingNames: makeBuildingNames(rawRequest),
  crews: makeCrews(rawRequest),
  warehouses: makeWarehouses(rawRequest),
  asteroidPage: makeAsteroidPage(rawRequest),
})

const makeFloorPrices =
  (rawRequest: RawRequest) => async (productIds: number[]) => {
    const request = esb
      .requestBodySearch()
      .size(0)
      .query(
        esb
          .boolQuery()
          .must([
            esb.matchQuery('orderType', '2'),
            esb.matchQuery('status', '1'),
            esb.termsQuery('product', productIds),
          ])
      )
      .agg(
        esb
          .termsAggregation('products', 'product')
          .size(9999)
          .agg(esb.minAggregation('floorPrice', 'price'))
      )
      .toJSON()

    const { aggregations } = await makeSearch(rawRequest)({
      index: 'order',
      options: {
        responseSchema: z.object({
          aggregations: z.object({
            products: z.object({
              buckets: z.array(
                z.object({
                  key: z.number(),
                  floorPrice: z.object({
                    value: z.number(),
                  }),
                })
              ),
            }),
          }),
        }),
      },
      request,
    })

    const floorPrices = new Map<number, number>()
    aggregations.products.buckets.forEach((bucket) => {
      floorPrices.set(bucket.key, bucket.floorPrice.value)
    })
    return floorPrices
  }

const makeAsteroidNames =
  (rawRequest: RawRequest) => async (asteroidIds: number[]) => {
    const entities = makeEntities(rawRequest)
    const result = await Promise.all(
      asteroidIds.map((id) =>
        entities({
          label: Entity.IDS.ASTEROID,
          id,
          components: ['Name'],
        })
      )
    )

    return new Map(
      result.flat().map((e) => [e.id, e.Name ?? e.id.toString()] as const)
    )
  }

const makeBuildingNames =
  (rawRequest: RawRequest) => async (buildingIds: number[]) => {
    const entities = makeEntities(rawRequest)
    const result = await Promise.all(
      buildingIds.map((id) =>
        entities({
          label: Entity.IDS.BUILDING,
          id,
          components: ['Name'],
        })
      )
    )
    return new Map(
      result.flat().map((e) => [e.id, e.Name ?? e.id.toString()] as const)
    )
  }

const makeCrews = (rawRequest: RawRequest) => async (walletAddress: string) =>
  makeEntities(rawRequest)({
    match: {
      path: 'Nft.owners.starknet',
      value: walletAddress.toLowerCase(),
    },
    label: 1,
  })

export type AsteroidPageArgs = {
  size: number
  searchAfter?: number[]
}

const makeAsteroidPage =
  (rawRequest: RawRequest) =>
  ({ size, searchAfter }: AsteroidPageArgs) => {
    const request = esb
      .requestBodySearch()
      .size(size)
      .sort(new esb.Sort('id').order('asc'))
      .trackTotalHits(true)
      .query(esb.boolQuery().filter(esb.existsQuery('Nft.owner')))

    return makeSearch(rawRequest)({
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
      index: 'asteroid',
      request: (searchAfter
        ? request.searchAfter(searchAfter)
        : request
      ).toJSON(),
    }).then(({ hits: { hits, total } }) => {
      const asteroids = hits.map((h) => h._source)
      const nextSearchAfter =
        hits.length > 0 ? hits[hits.length - 1]?.sort : undefined

      return { asteroids, nextSearchAfter, totalCount: total.value }
    })
  }

const makeWarehouses =
  (rawRequest: RawRequest) => async (walletAddress: string) => {
    const crews = await makeCrews(rawRequest)(walletAddress)
    const crewIds = crews.map((c) => c.id)
    const request = esb
      .requestBodySearch()
      .size(9999)
      .query(
        esb
          .boolQuery()
          .must([
            esb.termQuery('Building.buildingType', Building.IDS.WAREHOUSE),
            esb.termQuery(
              'Building.status',
              Building.CONSTRUCTION_STATUSES.OPERATIONAL
            ),
            esb.termsQuery('Control.controller.id', crewIds),
          ])
      )

    return makeSearch(rawRequest)({
      index: 'building',
      request,
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    }).then((r) => r.hits.hits.map((h) => h._source))
  }
