import { Building, Entity, Inventory } from '@influenceth/sdk'
import { A } from '@mobily/ts-belt'
import esb from 'elastic-builder'
import { z } from 'zod'
import { influenceApi } from '@/lib/influence-api/api'

export type BeltInventoryItem = {
  product: number
  amount: number
  containingWarehouses: number
  floorPrice?: number
}

export const getBeltInventory = (asteroidId?: number) =>
  influenceApi
    .search({
      index: 'building',
      request: esb
        .requestBodySearch()
        .size(0)
        .query(
          esb
            .boolQuery()
            .mustNot([esb.termsQuery('Control.controller.id', 1)])
            .must([
              esb.termsQuery('Building.buildingType', [
                Building.IDS.WAREHOUSE,
                Building.IDS.TANK_FARM,
              ]),
              esb.termQuery(
                'Building.status',
                Building.CONSTRUCTION_STATUSES.OPERATIONAL
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
        .aggs([
          esb
            .nestedAggregation('inventories', 'Inventories')
            .agg(
              esb
                .filterAggregation(
                  'warehouses',
                  esb.termsQuery('Inventories.inventoryType', [
                    Inventory.IDS.WAREHOUSE_PRIMARY,
                    Inventory.IDS.TANK_FARM_PRIMARY,
                  ])
                )
                .agg(
                  esb
                    .termsAggregation(
                      'containingWarehouses',
                      'Inventories.contents.product'
                    )
                    .size(300)
                )
            ),
          esb
            .scriptedMetricAggregation('products')
            .initScript('state.products = [:]')
            .mapScript(
              `
            for(inv in params["_source"]["Inventories"]) {
              if(inv["inventoryType"] == ${Inventory.IDS.WAREHOUSE_PRIMARY} || inv["inventoryType"] == ${Inventory.IDS.TANK_FARM_PRIMARY}) {
                for(c in inv["contents"]) {
                  def product = c["product"].toString();
                  if(state.products.containsKey(product)) {
                    state.products[product] += c["amount"]
                  } else {
                    state.products[product] = c["amount"] + 0L
                  }
                }
              }
            }
            `
            )
            .combineScript('return state.products')
            .reduceScript(
              `
              Map allProducts = new HashMap();
              for(state in states) {
                for(entry in state.entrySet()) {
                  def product = entry.getKey();
                  def amount = entry.getValue();
                  if(allProducts.containsKey(product)) {
                    allProducts[product] += amount;
                  } else {
                    allProducts[product] = amount;
                  }
                }
              }
              return allProducts;
            `
            ),
        ]),
      options: {
        responseSchema: z.object({
          aggregations: z.object({
            inventories: z.object({
              warehouses: z.object({
                containingWarehouses: z.object({
                  buckets: z.array(
                    z.object({
                      key: z.number(),
                      doc_count: z.number(),
                    })
                  ),
                }),
              }),
            }),
            products: z
              .object({
                value: z.record(z.number()),
              })
              .transform(({ value }) =>
                [...Object.entries(value)].map(([product, amount]) => ({
                  product: parseInt(product),
                  amount,
                }))
              ),
          }),
        }),
      },
    })
    .then(({ aggregations }) =>
      A.filterMap(aggregations.products, (productAmount) => {
        const containingWarehouses =
          aggregations.inventories.warehouses.containingWarehouses.buckets.find(
            (b) => b.key === productAmount.product
          )?.doc_count
        return containingWarehouses
          ? { ...productAmount, containingWarehouses }
          : undefined
      })
    )
