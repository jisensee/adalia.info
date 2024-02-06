import { z } from 'zod'

export const starkSightColumns = ['starkSightUser', 'starkSightGroup'] as const

const starkSightTokenResponseSchema = z.object({
  data: z.object({
    INFA: z.array(
      z.object({
        id: z.number(),
        starkSightUser: z.string().optional(),
        starkSightGroup: z.string().optional(),
      })
    ),
  }),
  expiration: z.string().datetime(),
  columns: z.array(z.enum(starkSightColumns)).default([]),
})

export type StarkSightTokenResponse = z.infer<
  typeof starkSightTokenResponseSchema
>

export type StarkSightTokenData = {
  token: string
  expiration: string
  data: StarkSightTokenResponse['data']
  columns: StarkSightTokenResponse['columns']
}

const prefixColumn = (column: string) =>
  `starkSight${column[0]?.toUpperCase() ?? ''}${column.slice(1)}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prefixColumns = (response: any): StarkSightTokenResponse => {
  return {
    ...response,
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      INFA: response.data.INFA.map((a: { user: any; group: any }) => ({
        ...a,
        starkSightUser: a?.user,
        starkSightGroup: a?.group,
      })),
    },
    columns: response.columns?.map(prefixColumn),
  }
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
  const json = await response.json().then(prefixColumns)
  const result = starkSightTokenResponseSchema.safeParse(json)
  if (!result.success) {
    console.error('Failed to parse StarkSight token response', result.error)
    return
  }
  return {
    token,
    expiration: result.data.expiration,
    data: result.data.data,
    columns: result.data.columns,
  }
}

export const decodeStarkSightToken = (token: string) => {
  const encodedName = token.split('-')[0]
  return encodedName ? atob(encodedName) : ''
}
