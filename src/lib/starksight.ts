import { z } from 'zod'

const starkSightTokenResponseSchema = z.object({
  data: z.object({
    INFA: z.array(
      z.object({
        id: z.number(),
      })
    ),
  }),
  expiration: z.string().datetime(),
})

export type StarkSightTokenResponse = z.infer<
  typeof starkSightTokenResponseSchema
>

export type StarkSightTokenData = {
  token: string
  expiration: string
  data: StarkSightTokenResponse['data']
}

export const fetchStarkSightTokenData = async (
  token: string
): Promise<StarkSightTokenData | undefined> => {
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
  return {
    token,
    expiration: result.data.expiration,
    data: result.data.data,
  }
}

export const decodeStarkSightToken = (token: string) => {
  const encodedName = token.split('-')[0]
  return encodedName ? atob(encodedName) : ''
}
