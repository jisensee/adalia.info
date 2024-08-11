import { z } from 'zod'
import {
  Entity,
  Inventory,
  Process,
  Product,
  ProductType,
} from '@influenceth/sdk'
import { getEntityName } from 'influence-typed-sdk/api'
import { A, D, G, pipe } from '@mobily/ts-belt'
import { groupArrayBy } from '@/lib/utils'
import { influenceApi } from '@/lib/influence-api/api'

export type ProductProduction = {
  product: ProductType
  amount: number
  producers: number
  floorPrice: number
  recipes?: number
}

export const getAllProductions = (
  asteroidId?: number
): Promise<ProductProduction[]> =>
  influenceApi
    .search({
      index: 'building',
      // elastic-builder does not support multi_terms aggregations...
      request: {
        size: 1,
        aggs: {
          processes: {
            nested: { path: 'Processors' },
            aggs: {
              running: {
                multi_terms: {
                  size: 9999,
                  terms: [
                    { field: 'Processors.runningProcess' },
                    { field: 'Processors.outputProduct' },
                  ],
                },
                aggs: { recipes: { sum: { field: 'Processors.recipes' } } },
              },
            },
          },
          extractors: {
            terms: { field: 'Extractors.outputProduct', size: 999 },
            aggs: { yield: { sum: { field: 'Extractors.yield' } } },
          },
        },
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      nested: {
                        path: 'Processors',
                        query: { range: { 'Processors.recipes': { gte: 1 } } },
                      },
                    },
                    { range: { 'Extractors.yield': { gte: 1 } } },
                  ],
                },
              },
              ...(asteroidId
                ? [
                    {
                      nested: {
                        path: 'Location.locations',
                        query: {
                          bool: {
                            must: [
                              {
                                term: {
                                  'Location.locations.label':
                                    Entity.IDS.ASTEROID,
                                },
                              },
                              {
                                term: {
                                  'Location.locations.id': asteroidId,
                                },
                              },
                            ],
                          },
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        },
      },
      options: {
        responseSchema: z.object({
          aggregations: z.object({
            processes: z.object({
              running: z.object({
                buckets: z.array(
                  z.object({
                    key: z.tuple([
                      z.number().transform(Process.getType),
                      z.number().transform(Product.getType),
                    ]),
                    recipes: z.object({ value: z.number() }),
                    doc_count: z.number(),
                  })
                ),
              }),
            }),
            extractors: z.object({
              buckets: z.array(
                z.object({
                  key: z.number().transform(Product.getType),
                  yield: z.object({ value: z.number() }),
                  doc_count: z.number(),
                })
              ),
            }),
          }),
        }),
      },
    })
    .then(async ({ aggregations }) => {
      const processBuckets = aggregations.processes.running.buckets
      const extractorBuckets = aggregations.extractors.buckets

      const products = [
        ...processBuckets.map((b) => b.key[1].i),
        ...extractorBuckets.map((b) => b.key.i),
      ]
      const floorPrices = await influenceApi.util.floorPrices(products, {
        asteroidId,
      })

      const processes: ProductProduction[] = processBuckets.flatMap((b) => {
        const [process, outputProduct] = b.key
        const [, outputAmountPerRecipe] = Object.entries(
          process.outputs ?? {}
        ).find(([productId]) => productId === outputProduct.i.toString()) ?? [
          0, 0,
        ]
        const outputAmount = outputAmountPerRecipe * b.recipes.value
        return [
          {
            product: outputProduct,
            amount: outputAmount,
            producers: b.doc_count,
            recipes: b.recipes.value,
            floorPrice: floorPrices.get(outputProduct.i) ?? 0,
          },
        ]
      })
      const extractions: ProductProduction[] = extractorBuckets.map((b) => ({
        product: b.key,
        amount: b.yield.value,
        producers: b.doc_count,
        floorPrice: floorPrices.get(b.key.i) ?? 0,
      }))

      return dedupeProductions([...extractions, ...processes])
    })

const dedupeProductions = (productions: ProductProduction[]) => {
  return [...groupArrayBy(productions, (p) => p.product.i).values()].map(
    (entries) =>
      entries.reduce((acc, entry) => {
        return {
          recipes: (acc.recipes ?? 0) + (entry.recipes ?? 0),
          producers: acc.producers + entry.producers,
          amount: acc.amount + entry.amount,
          floorPrice: entry.floorPrice,
          product: entry.product,
        }
      })
  )
}

export type WarehouseContent = {
  warehouseId: number
  warehouseName: string
  asteroidId: number
  contents: {
    product: number
    amount: number
    floorPrice?: number
  }[]
}
export const getWarehouseContents = async (
  walletAddress: string,
  asteroidId?: number
) => {
  const warehouses = await influenceApi.util.warehouses(
    walletAddress,
    asteroidId
  )

  const contents = pipe(
    warehouses,
    A.filterMap((w) => {
      const contents = w.Inventories.find(
        (i) => i.inventoryType === Inventory.IDS.WAREHOUSE_PRIMARY
      )?.contents

      if (contents === undefined) {
        return []
      }
      return [
        {
          warehouseName: getEntityName(w),
          warehouseId: w.id,
          asteroidId: w.Location?.resolvedLocations?.asteroid?.id ?? 0,
          contents,
        },
      ]
    }),
    A.flat
  )

  const floorPrices = await getFloorPrices(
    pipe(
      contents,
      A.groupBy((c) => c.asteroidId),
      D.mapWithKey((asteroidId, asteroidContents) =>
        asteroidContents?.flatMap((c) =>
          c.contents?.map((a) => ({ productId: a.product, asteroidId }))
        )
      ),
      D.values,
      A.flat,
      A.filter(G.isNotNullable)
    )
  )

  return [contents, floorPrices] as const
}

export type ProductInventory = {
  product: ProductType
  amount: number
  floorPrice: number
}

export const getFloorPrices = async (
  products: { productId: number; asteroidId: number }[]
) =>
  pipe(
    products,
    A.groupBy((p) => p.asteroidId),
    D.map((asteroidOrders) => asteroidOrders?.map((p) => p.productId) ?? []),
    D.mapWithKey(async (asteroidId, products) => {
      const floorPrices = await influenceApi.util.floorPrices(products, {
        asteroidId,
      })
      return [parseInt(asteroidId.toString()), floorPrices] as const
    }),
    D.values,
    (r) => Promise.all(r)
  ).then((r) => new Map(r))
