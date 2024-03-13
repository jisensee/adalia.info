import { FC } from 'react'
import { getCrews } from './api'
import { AsteroidOverview } from './asteroid-overview'
import { preReleaseInfluenceApi } from '@/lib/influence-api'
import { groupArrayBy } from '@/lib/utils'
import { Accordion } from '@/components/ui/accordion'

export type CrewTrackerProps = {
  walletAddress: string
}

export const CrewTracker: FC<CrewTrackerProps> = async ({ walletAddress }) => {
  const crews = await getCrews(walletAddress)
  const asteroidIds = crews.flatMap((c) => (c.asteroidId ? [c.asteroidId] : []))
  const asteroidNames =
    await preReleaseInfluenceApi.util.getAsteroidNames(asteroidIds)

  const getAsteroidName = (id: number) => asteroidNames.get(id) ?? 'In Flight'

  const groupedCrews = [
    ...groupArrayBy(crews, (c) => c.asteroidId ?? 0).entries(),
  ]

  return (
    <div className='flex flex-col gap-y-3'>
      <Accordion
        defaultValue={[...asteroidNames.values(), 'In Flight']}
        type='multiple'
      >
        {groupedCrews.map(([asteroidId, crews]) => (
          <AsteroidOverview
            key={asteroidId}
            location={getAsteroidName(asteroidId)}
            crews={crews}
          />
        ))}
      </Accordion>
    </div>
  )
}
