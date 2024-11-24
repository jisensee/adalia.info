import { A, pipe } from '@mobily/ts-belt'
import { differenceInSeconds } from 'date-fns'
import { getLeaderboard, getShips, Race } from './data'
import { LeaderboardEntry, LeaderBoardEntryDetails } from './leaderboard-entry'
import { SwayAmount } from '@/components/sway-amount'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { influenceApi } from '@/lib/influence-api/api'

import { Format } from '@/lib/format'
import { InfoTooltip } from '@/components/ui/tooltip'

export type RunningRaceProps = {
  race: Race
}
export const RunningRace = async ({ race }: RunningRaceProps) => {
  const asteroidIds = pipe(
    race.participants,
    A.map((p) => p.transits.map((t) => [t.origin, t.destination])),
    A.flat,
    A.flat,
    A.uniq
  )
  const [shipMap, asteroidNames] = await Promise.all([
    getShips(race),
    influenceApi.util.asteroidNames(asteroidIds),
  ])

  const leaderboard = getLeaderboard(race, shipMap)

  const pricePool = race.firstPrice + race.secondPrice + race.thirdPrice

  return (
    <div className='flex flex-col items-center gap-y-3 p-3'>
      <h1>{race.name}</h1>
      <div className='flex flex-wrap items-center justify-center gap-x-10 gap-y-3'>
        <div className='text-center'>
          <p className='font-bold text-primary'>Ends in</p>
          <div className='flex items-center gap-x-2'>
            <p className='text-xl'>
              {Format.remainingTime(differenceInSeconds(race.end, new Date()))}
            </p>
            <InfoTooltip size={20}>{race.end.toLocaleString()}</InfoTooltip>
          </div>
        </div>
        <div className='flex flex-col items-center gap-x-3'>
          <p className='font-bold text-primary'>Total Prize Pool</p>
          <SwayAmount sway={pricePool * 1e6} allDigits large />
        </div>
      </div>
      <div className='flex flex-col gap-y-2'>
        {leaderboard.map((entry, index) => (
          <Dialog key={entry.id}>
            <DialogTrigger>
              <LeaderboardEntry race={race} place={index + 1} entry={entry} />
            </DialogTrigger>
            <DialogContent>
              <LeaderBoardEntryDetails
                race={race}
                place={index + 1}
                entry={entry}
                asteroidNames={asteroidNames}
              />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
