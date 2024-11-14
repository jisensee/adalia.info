import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import {
  startAsteroidSync,
  startScheduledAsteroidSync,
  updateAsteroidPage,
  updateAsteroidsDb,
} from '@/inngest/asteroid-api-sync'
import { updateShipRaces } from '@/inngest/ship-races'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    startAsteroidSync,
    startScheduledAsteroidSync,
    updateAsteroidPage,
    updateAsteroidsDb,
    updateShipRaces,
  ],
})
