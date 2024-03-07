import { Entity, Lot } from '@influenceth/sdk'
import {
  ApiAsteroid,
  EntityResponse,
  InventoryResponseItem,
  entityResponseSchema,
} from './influence-api-types'

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

export type InfluenceApi = {
  rawRequest: <Data>(path: string, requestInit: RequestInit) => Promise<Data>
  entities: (params: EntityRequestParams) => Promise<EntityResponse>
}

export const influenceApi = (
  baseUrl: string,
  accessToken: string
): InfluenceApi => {
  const rawRequest = <Data>(path: string, requestInit: RequestInit) => {
    const init: RequestInit = {
      ...requestInit,
      headers: {
        ...requestInit.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }
    const url = `${baseUrl}/${path}`

    return fetch(url, init).then((res) => {
      if (res.ok) {
        return res.json() as Promise<Data>
      } else {
        return Promise.reject({ code: res.status, message: res.statusText })
      }
    })
  }

  return {
    rawRequest,
    entities: (params: EntityRequestParams) => {
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
    },
  }
}

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
