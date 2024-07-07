import { makeInfluenceApi, influenceApiUrl } from 'influence-typed-sdk/api'
import { makeInfluenceImageUrls } from 'influence-typed-sdk/images'
export type InfluenceApi = ReturnType<typeof makeInfluenceApi>

export const influenceApi = makeInfluenceApi({
  baseUrl: influenceApiUrl,
  accessToken: process.env.INFLUENCE_API_ACCESS_TOKEN ?? '',
})

export const influenceImages = makeInfluenceImageUrls()
