import { getEntityName } from 'influence-typed-sdk/api'
import { getShips, Race } from './data'
import { PricePool } from './price-pool'
import { ShipIcon } from '@/components/influence-asset-icons'

export type UpcomingRaceProps = {
  race: Race
}

export const UpcomingRace = async ({ race }: UpcomingRaceProps) => {
  const ships = await getShips(race)
  return (
    <div className='flex flex-col items-center gap-y-3 p-3 '>
      <h1>{race.name}</h1>
      <p className='text-center'>
        Running from{' '}
        <span className='font-bold'>{race.start.toLocaleString()}</span> until{' '}
        <span className='font-bold'>{race.end.toLocaleString()}</span>
      </p>
      <h2>Price Pool</h2>
      <PricePool race={race} />
      <h2>{race.participants.length} Participants</h2>
      <div className='flex flex-col gap-y-2'>
        {race.participants.map((p) => {
          const ship = ships.get(p.shipId)
          if (!ship) return null
          return (
            <div
              key={p.shipId}
              className='flex gap-x-1 rounded px-3 py-1 ring-1 ring-primary'
            >
              <ShipIcon ship={ship.Ship?.shipType ?? 1} size={100} />
              <div className='flex grow flex-col items-start'>
                <p className='text-xl text-primary'>{p.playerName}</p>
                <p>{getEntityName(ship)}</p>
              </div>
            </div>
          )
        })}
      </div>
      <p className='text-center italic'>
        Price pool and participant list are subject to change until the race
        starts.
      </p>
    </div>
  )
}
