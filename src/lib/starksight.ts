import { z } from 'zod'

const starkSightTokenResponseSchema = z.object({
  data: z.object({
    INFA: z.array(
      z.object({
        id: z.number(),
      })
    ),
  }),
})

export const fetchStarkSightAsteroidIds = async (token: string) => {
  const response = await fetch(`https://starksight.plus/api/share/${token}`, {
    headers: {
      'X-API-Key': process.env.STARKSIGHT_API_KEY ?? '',
    },
  })
  if (!response.ok) {
    return
  }
  const result = starkSightTokenResponseSchema.safeParse(await response.json())
  if (!result.success) {
    return
  }
  return result.data.data.INFA.map(({ id }) => id)
}

export const decodeStarkSightToken = (token: string) => {
  const encodedName = token.split('-')[0]
  if (!encodedName) {
    return
  }
  return atob(encodedName)
}
