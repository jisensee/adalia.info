import { Entity } from '@influenceth/sdk'
import { z } from 'zod'
import { RawRequest } from './raw-request'
import { ActivityEvent } from './types'
import { activitySchema } from './activity-schema'

export type ActivityArgs = {
  crewId: number
  page?: number
  pageSize?: number
  types?: ActivityEvent[]
}

export const makeActivity =
  (rawRequest: RawRequest) => async (args: ActivityArgs) => {
    const crewUuid = Entity.packEntity({
      id: args.crewId,
      label: Entity.IDS.CREW,
    })
    const params = new URLSearchParams({
      page: args.page?.toString() ?? '1',
      pageSize: args.pageSize?.toString() ?? '25',
    })
    if (args.types) {
      params.append('types', args.types.join(','))
    }

    return rawRequest(`v2/entities/${crewUuid}/activity?${params.toString()}`, {
      responseSchema: z.array(activitySchema),
    })
  }
