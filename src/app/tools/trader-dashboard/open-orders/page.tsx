import { Address, Order } from '@influenceth/sdk'
import { orderSchema, searchResponseSchema } from 'influence-typed-sdk/api'
import { traderDashbboardParamsCache } from '../params'
import { OpenOrdersTable } from './table'
import { influenceApi } from '@/lib/influence-api/api'

export default async function OpenOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { walletAddress } = traderDashbboardParamsCache.parse(searchParams)
  if (!walletAddress) {
    return null
  }

  const [ordersResult, crewNames] = await Promise.all([
    getOrders(walletAddress),
    getCrewNames(walletAddress),
  ])
  const orders = ordersResult.hits.hits.map((hit) => hit._source)
  const asteroidIds = [
    ...new Set(
      orders.flatMap(({ locations: { asteroid } }) =>
        asteroid ? [asteroid.id] : []
      )
    ),
  ]
  const marketplaceIds = [
    ...new Set(
      orders.flatMap(({ locations: { building } }) =>
        building ? [building.id] : []
      )
    ),
  ]
  const [floorPrices, asteroidNames, marketplaceNames] = await Promise.all([
    influenceApi.util.floorPrices([...new Set(orders.map((o) => o.product.i))]),
    influenceApi.util.asteroidNames(asteroidIds),
    influenceApi.util.buildingNames(marketplaceIds),
  ])

  return (
    <div>
      <OpenOrdersTable
        orders={orders}
        crewNames={crewNames}
        floorPrices={floorPrices}
        asteroidNames={asteroidNames}
        marketplaceNames={marketplaceNames}
      />
    </div>
  )
}

const getCrewNames = async (address: string) => {
  const crews = await influenceApi.util.crews(address)
  const crewNames = new Map<number, string>()
  crews.forEach((crew) =>
    crewNames.set(crew.id, crew.Name ?? `Crew#${crew.id}`)
  )
  return crewNames
}

const getOrders = async (address: string) =>
  influenceApi.search({
    index: 'order',
    request: {
      size: 100,
      query: {
        bool: {
          filter: [
            {
              term: {
                initialCaller: Address.toStandard(address),
              },
            },
            {
              term: {
                status: Order.STATUSES.OPEN,
              },
            },
          ],
        },
      },
    },
    options: {
      responseSchema: searchResponseSchema(orderSchema),
    },
  })
