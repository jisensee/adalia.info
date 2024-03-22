import { Building, Entity, Lot } from '@influenceth/sdk'
import { ZodObject, ZodRawShape, z } from 'zod'
import {
  ActivityEvent,
  ApiAsteroid,
  EntityIds,
  InventoryResponseItem,
  entityResponseSchema,
  entitySchema,
} from './influence-api-types'
import { activitySchema } from './activity'

type AsteroidHit = {
  _source: ApiAsteroid
  sort: number[]
}

type Hits = {
  total: {
    value: number
  }
  hits: AsteroidHit[]
}
const request = (path: string, method: 'GET' | 'POST', data?: object) =>
  fetch(`https://api.influenceth.io/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.INFLUENCE_API_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.text())

export const getAsteroidPage = (size: number, searchAfter?: number[]) =>
  request('_search/asteroid', 'POST', {
    query: {
      bool: {
        filter: {
          exists: {
            field: 'Nft.owner',
          },
        },
      },
    },
    size,
    sort: [
      {
        id: 'asc',
      },
    ],
    search_after: searchAfter,
    track_total_hits: true,
  })
    .then(JSON.parse)
    .then((d) => {
      const { total, hits } = d.hits as Hits
      const asteroids = hits.map((h) => h._source)
      const nextSearchAfter =
        hits.length > 0 ? hits[hits.length - 1]?.sort : undefined

      return { asteroids, nextSearchAfter, totalCount: total.value }
    })

type EntityMatch = {
  path: string
  value: string | number
}
type EntityRequestParams = {
  match?: EntityMatch
  components?: string[]
  label?: number
  id?: number
}

export const searchResponseSchema = <Entity extends ZodRawShape>(
  entitySchema: ZodObject<Entity>
) =>
  z.object({
    hits: z.object({
      total: z.object({
        value: z.number(),
      }),
      hits: z.array(
        z.object({
          _source: entitySchema,
        })
      ),
    }),
  })

type RequestOptions = {
  logRequest?: boolean
}

export const influenceApi = (baseUrl: string, accessToken: string) => {
  const rawRequest = <Data>(
    path: string,
    requestInit: RequestInit = {},
    options?: RequestOptions
  ) => {
    const init: RequestInit = {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }
    const url = `${baseUrl}/${path}`

    if (options?.logRequest) {
      console.log(requestInit.method ?? 'GET', url, init.body ?? '')
    }
    return fetch(url, init)
      .then(async (res) => {
        if (res.ok) {
          return res.json() as Promise<Data>
        } else {
          return Promise.reject({ code: res.status, message: res.statusText })
        }
      })
      .then((data) => {
        if (options?.logRequest) {
          console.log(JSON.stringify(data, null, 2))
        }
        return data
      })
  }
  const entities = (params: EntityRequestParams) => {
    const queryParams = new URLSearchParams()

    if (params.match) {
      const matchValue =
        typeof params.match.value === 'string'
          ? `"${params.match.value}"`
          : params.match.value

      queryParams.append('match', `${params.match.path}:${matchValue}`)
    }

    if (params.components) {
      queryParams.append('components', params.components.join(','))
    }
    if (params.label) {
      queryParams.append('label', params.label.toString())
    }
    if (params.id) {
      queryParams.append('id', params.id.toString())
    }
    return rawRequest(`v2/entities?${queryParams.toString()}`, {
      cache: 'no-store',
    })
      .then((r) => entityResponseSchema.safeParse(r))
      .then((result) =>
        result.success ? result.data : Promise.reject(result.error)
      )
  }

  const entity = (ids: EntityIds, components?: string[]) =>
    entities({
      id: ids.id,
      label: ids.label,
      components,
    }).then((e) => e[0])

  const search = <Result extends ZodRawShape>(
    index: 'order' | 'asteroid' | 'building',
    request: Record<string, unknown>,
    resultSchema: ZodObject<Result>,
    options?: RequestOptions
  ) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawRequest<Result>(
      `_search/${index}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      options
    ).then(resultSchema.parse)

  const getAsteroidNames = async (asteroidIds: number[]) => {
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
      result.flat().map((e) => [e.id, e.Name?.name ?? e.id.toString()] as const)
    )
  }

  const getBuildingNames = async (buildingIds: number[]) => {
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
      result.flat().map((e) => [e.id, e.Name?.name ?? e.id.toString()] as const)
    )
  }

  const getCrews = async (walletAddress: string) =>
    entities({
      match: {
        path: 'Nft.owners.starknet',
        value: walletAddress.toLowerCase(),
      },
      label: 1,
    })

  const activity = async (args: {
    crewId: number
    page?: number
    pageSize?: number
    types?: ActivityEvent[]
  }) => {
    const crewUuid = Entity.packEntity({
      id: args.crewId,
      label: Entity.IDS.CREW,
    })
    const params = new URLSearchParams({
      page: args.page?.toString() ?? '1',
      pageSize: args.pageSize?.toString() ?? '25',
    })
    if (args.types) {
      params.append('types', args.types.join(','))
    }

    return rawRequest<unknown[]>(
      `v2/entities/${crewUuid}/activity?${params.toString()}`,
      {}
    ).then((activities) =>
      activities.flatMap((a) => {
        const r = activitySchema.safeParse(a)
        if (r.success) {
          return [r.data]
        }
        return []
      })
    )
  }

  const floorPrices = async (productIds: number[]) => {
    const result = await preReleaseInfluenceApi.search(
      'order',
      {
        size: 0,
        aggs: {
          products: {
            terms: {
              size: 9999,
              field: 'product',
            },
            aggs: {
              floorPrice: {
                min: {
                  field: 'price',
                },
              },
            },
          },
        },
        query: {
          bool: {
            must: [
              { range: { orderType: { gte: 2, lte: 2 } } },
              { match: { status: 1 } },
              { terms: { product: productIds } },
            ],
          },
        },
      },
      z.object({
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
      })
    )

    const floorPrices = new Map<number, number>()
    result.aggregations.products.buckets.forEach((bucket) => {
      floorPrices.set(bucket.key, bucket.floorPrice.value)
    })
    return floorPrices
  }

  const getWarehousesOfAddress = async (walletAddress: string) => {
    const crews = await getCrews(walletAddress)
    const crewIds = crews.map((c) => c.id)

    return search(
      'building',
      {
        size: 9999,
        query: {
          bool: {
            must: [
              { term: { 'Building.buildingType': Building.IDS.WAREHOUSE } },
              {
                term: {
                  'Building.status': Building.CONSTRUCTION_STATUSES.OPERATIONAL,
                },
              },
              {
                terms: {
                  'Control.controller.id': crewIds,
                },
              },
            ],
          },
        },
      },
      searchResponseSchema(entitySchema)
    ).then((r) => r.hits.hits.map((h) => h._source))
  }

  return {
    rawRequest,
    entities,
    entity,
    search,
    activity,
    util: {
      getAsteroidNames,
      getBuildingNames,
      getCrews,
      floorPrices,
      getWarehousesOfAddress,
    },
  }
}

export type InfluenceApi = ReturnType<typeof influenceApi>

export const preReleaseInfluenceApi = influenceApi(
  'https://api-prerelease.influenceth.io',
  process.env.PRERELEASE_INFLUENCE_API_ACCESS_TOKEN ?? ''
)

export const getWarehouseInventory = async (
  asteroidId: number,
  lotIndex: number
) => {
  const token = process.env.PRERELEASE_INFLUENCE_API_ACCESS_TOKEN ?? ''
  const uuid = Entity.packEntity({
    id: Lot.toId(asteroidId, lotIndex),
    label: 4,
  })

  const url = `https://api-prerelease.influenceth.io/v2/entities?match=Location.locations.uuid%3A%22${uuid}%22&components=Inventory`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  const items = await (response.json() as Promise<InventoryResponseItem[]>)

  return items
    .flatMap((i) => i.Inventories)
    .filter((i) => i.inventoryType === 10)
    .flatMap((i) => i.contents)
}

export const getInOutputs = (inOrOutputs: Record<number, number>) =>
  Object.keys(inOrOutputs).map((i) => parseInt(i, 10))
