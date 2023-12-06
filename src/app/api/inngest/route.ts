import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import {
  startAsteroidSync,
  startScheduledAsteroidSync,
  updateAsteroidPage,
} from '@/inngest/asteroid-api-sync'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    startAsteroidSync,
    startScheduledAsteroidSync,
    updateAsteroidPage,
  ],
})
