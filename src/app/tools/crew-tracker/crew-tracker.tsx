'use client'

import { FC } from 'react'
import { CrewStatusData } from './api'
import { AsteroidOverview } from './asteroid-overview'
import { groupArrayBy } from '@/lib/utils'
import { Accordion } from '@/components/ui/accordion'
import { usePeriodicRefresh } from '@/hooks/timers'

export type CrewTrackerProps = {
  crews: CrewStatusData[]
  asteroidNames: Map<number, string>
}

export const CrewTracker: FC<CrewTrackerProps> = ({ crews, asteroidNames }) => {
  const getAsteroidName = (id: number) => asteroidNames.get(id) ?? 'In Flight'

  const groupedCrews = [
    ...groupArrayBy(crews, (c) => c.asteroidId ?? 0).entries(),
  ]

  usePeriodicRefresh()

  return (
    <div className='flex flex-col gap-y-3'>
      <Accordion
        defaultValue={[...asteroidNames.values(), 'In Flight']}
        type='multiple'
      >
        {groupedCrews.map(([asteroidId, c]) => (
          <AsteroidOverview
            key={asteroidId}
            location={getAsteroidName(asteroidId)}
            crews={c}
          />
        ))}
      </Accordion>
    </div>
  )
}
