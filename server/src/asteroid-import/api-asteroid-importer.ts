import fetch from 'node-fetch'
import { ApiAsteroid, convertApiAsteroidToInternal } from './api-asteroid'
import { AsteroidImporter, ImportType } from './asteroid-import'

const apiUrl = 'https://api.influenceth.io/v1'
const authUrl = `${apiUrl}/auth/token`
const asteroidsUrl = `${apiUrl}/asteroids`

const clientId = process.env.INFLUENCE_CLIENT_ID
const clientSecret = process.env.INFLUENCE_CLIENT_SECRET

const getOwnedPageUrl = (pageNum: number, pageSize: number) =>
  `${asteroidsUrl}?ownedBy=owned&page=${pageNum}&perPage=${pageSize}`

const isActive = clientId && clientSecret
const pageSize = 30

const getAsteroidPage = (accessToken: string, page: number) =>
  fetch(getOwnedPageUrl(page, pageSize), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((r) => r.json())
    .then((r) => {
      return r
    })
    .then((r) => r as unknown as ApiAsteroid[])

const getAccessToken = async () => {
  if (!clientId || !clientSecret) {
    console.log('no secrets')
    return null
  }
  const response = await fetch(authUrl, {
    method: 'post',
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    console.log(
      'Could not retrieve access token from influence API',
      await response.text()
    )
    return null
  }

  const body = (await response.json()) as Record<string, string>

  return body['access_token']
}

const importer: AsteroidImporter = {
  type: ImportType.Api,
  run: async (persist) => {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      console.log('could not get access token')
      return
    }
    // Set to zero when all asteroids have been updated
    let page = 1
    let totalUpdated = 0
    while (page > 0) {
      const batchStart = new Date().getTime()
      try {
        const rocks = await getAsteroidPage(accessToken, page)
        await persist(rocks.map(convertApiAsteroidToInternal))

        const batchDuration = (
          (new Date().getTime() - batchStart) /
          1000
        ).toFixed(2)

        console.log(
          `Updated ${rocks.length} (page ${page}) rocks for a total of ${totalUpdated} in ${batchDuration} seconds.`
        )

        page += 1
        totalUpdated += rocks.length
        // If we get less rocks than we requested, we got all and can exit
        if (rocks.length < pageSize) {
          page = 0
        }
      } catch (err) {
        console.log('Could not finish API import due to an error', err)
        return
      }
    }
  },
}

const getApiImporter = () => (isActive ? importer : null)

export { getApiImporter }
