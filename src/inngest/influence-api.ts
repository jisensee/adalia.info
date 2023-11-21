import { ApiAsteroid } from './types'

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MWU0MTRiYS1iNGYyLTRmYTUtOTI1OC1hMDc2ODVkZWZkNmIiLCJpYXQiOjE2OTkxOTE2Mjl9.BqiOZ9_FsMmgtmCsww-2qeAkqOYNCAszCcAAxfLD4DA'

const request = (path: string, method: 'GET' | 'POST', data?: object) =>
  fetch(`https://api.influenceth.io/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  }).then((res) => res.text())

export const getLastPurchaseOrder = () =>
  request('_search/asteroid', 'POST', {
    sort: {
      'Celestial.purchaseOrder': 'desc',
    },
  })
    .then(JSON.parse)
    .then(
      (d) => d.hits.hits[0]._source.Celestial.purchaseOrder
    ) as Promise<number>

export const getAdaliaPrime = () =>
  request('v2/entities?id=1&label=3', 'GET')
    .then(JSON.parse)
    .then((r) => r[0]) as Promise<ApiAsteroid>

export const getAsteroids = (
  fromPurchaseOrder: number,
  toPurchaseOrder: number
) =>
  request('_search/asteroid', 'POST', {
    query: {
      range: {
        'Celestial.purchaseOrder': {
          gte: fromPurchaseOrder,
          lte: toPurchaseOrder,
        },
      },
    },
    size: toPurchaseOrder - fromPurchaseOrder + 1,
    sort: [
      {
        'Celestial.purchaseOrder': 'asc',
      },
    ],
  })
    .then(JSON.parse)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((d) => d.hits.hits.map((h: any) => h._source)) as Promise<
    ApiAsteroid[]
  >
