import { z } from 'zod'
import {
  Entity,
  Inventory,
  Process,
  Product,
  ProductType,
} from '@influenceth/sdk'
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
      const floorPrices = await influenceApi.util.floorPrices(products)

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
    product: ProductType
    amount: number
    marketValue: number
    floorPrice: number
  }[]
}
export const getWarehouseContents = async (
  walletAddress: string
): Promise<WarehouseContent[]> => {
  const warehouses = await influenceApi.util.warehouses(walletAddress)

  const contents = warehouses.flatMap((w) => {
    const contents = w.Inventories.find(
      (i) => i.inventoryType === Inventory.IDS.WAREHOUSE_PRIMARY
    )?.contents

    if (contents === undefined) {
      return []
    }
    return [
      {
        warehouseName: w.Name ?? `Warehouse#${w.id}`,
        warehouseId: w.id,
        asteroidId: w.Location?.locations?.asteroid?.id ?? 0,
        contents: contents.map((c) => ({
          ...c,
          marketValue: 0,
        })),
      },
    ]
  })

  const products = [
    ...new Set(contents.flatMap((c) => c.contents.map((c) => c.product.i))),
  ]
  const floorPrices = await influenceApi.util.floorPrices(products)

  return contents.map((wc) => ({
    ...wc,
    contents: wc.contents.map((c) => ({
      ...c,
      marketValue: c.amount * (floorPrices.get(c.product.i) ?? 0),
      floorPrice: floorPrices.get(c.product.i) ?? 0,
    })),
  }))
}
