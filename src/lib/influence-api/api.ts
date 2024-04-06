import { ApiConfig, makeRawRequest } from './raw-request'
import { makeSearch } from './search'
import { makeEntities, makeEntity } from './entity'
import { makeUtils } from './util'
import { makeActivity } from './activity'

export const makeInfluenceApi = (config: ApiConfig) => {
  const rawRequest = makeRawRequest(config)
  return {
    rawRequest,
    search: makeSearch(rawRequest),
    entity: makeEntity(rawRequest),
    entities: makeEntities(rawRequest),
    activity: makeActivity(rawRequest),
    util: makeUtils(rawRequest),
  }
}

export type InfluenceApi = ReturnType<typeof makeInfluenceApi>

export const preReleaseInfluenceApiUrl = 'https://api-prerelease.influenceth.io'
export const influenceApiUrl = 'https://api.influenceth.io'

export const preReleaseInfluenceApi = makeInfluenceApi({
  baseUrl: preReleaseInfluenceApiUrl,
  accessToken: process.env.PRERELEASE_INFLUENCE_API_ACCESS_TOKEN ?? '',
})

export const influenceApi = makeInfluenceApi({
  baseUrl: influenceApiUrl,
  accessToken: process.env.INFLUENCE_API_ACCESS_TOKEN ?? '',
})
