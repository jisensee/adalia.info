import { ZodTypeAny } from 'zod'
import { RawRequest, RequestOptions } from './raw-request'

export type InfluenceIndex =
  | 'order'
  | 'asteroid'
  | 'building'
  | 'deposit'
  | 'ship'
  | 'delivery'
  | 'crew'
  | 'crewmate'
  | 'lot'

export type SearchArgs<Schema extends ZodTypeAny> = {
  index: InfluenceIndex
  request: object
  options: RequestOptions<Schema>
}

export const makeSearch =
  (rawRequest: RawRequest) =>
  <Schema extends ZodTypeAny>({
    index,
    request,
    options,
  }: SearchArgs<Schema>) =>
    rawRequest(`_search/${index}`, {
      ...options,
      requestInit: {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    })
