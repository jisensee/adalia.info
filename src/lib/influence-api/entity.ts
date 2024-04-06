import { z } from 'zod'
import { RawRequest } from './raw-request'
import { EntityIds, entitySchema } from './types'

export type EntityMatch = {
  path: string
  value: string | number
}
export type EntitiesArgs = {
  match?: EntityMatch
  components?: string[]
  label?: number
  id?: number
}
export const makeEntities =
  (rawRequest: RawRequest) =>
  ({ match, components, label, id }: EntitiesArgs) => {
    const queryParams = new URLSearchParams()

    if (match) {
      const matchValue =
        typeof match.value === 'string' ? `"${match.value}"` : match.value

      queryParams.append('match', `${match.path}:${matchValue}`)
    }

    if (components) {
      queryParams.append('components', components.join(','))
    }
    if (label) {
      queryParams.append('label', label.toString())
    }
    if (id) {
      queryParams.append('id', id.toString())
    }
    return rawRequest(`v2/entities?${queryParams.toString()}`, {
      responseSchema: z.array(entitySchema),
    })
  }

export type EntityArgs = Omit<EntityIds, 'uuid'> & {
  components?: string[]
}
export const makeEntity = (rawRequest: RawRequest) => (args: EntityArgs) =>
  makeEntities(rawRequest)(args).then((entities) => entities[0])
