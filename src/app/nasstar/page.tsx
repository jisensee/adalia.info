import { isFuture } from 'date-fns'
import { notFound } from 'next/navigation'
import { match, P } from 'ts-pattern'
import { getRace } from './data'
import { RunningRace } from './running-race'
import { UpcomingRace } from './upcoming-race'

export const generateMetadata = async () => {
  const raceResult = await getRace()
  return {
    title: `${raceResult?.name ?? 'Ship races'} | adalia.info`,
  }
}

export default async function Page() {
  const raceResult = await getRace()
  return match(raceResult)
    .with(P.nullish, () => notFound())
    .with(
      P.when((r) => isFuture(r.start)),
      (race) => <UpcomingRace race={race} />
    )
    .otherwise((race) => <RunningRace race={race} />)
}
