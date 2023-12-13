import { LastAsteroidTransfers } from './last-asteroid-transfers'
import { LastScannedAsteroids } from './last-scanned-asteroids'
import { OwnedAsteroids } from './owned-asteroids'

export const revalidate = 60

export default async function Home() {
  return (
    <div className='flex flex-col gap-y-5 px-3'>
      <p className='text-center text-4xl'>
        Welcome to <span className='text-4xl text-primary'>adalia.info</span>!
      </p>
      <OwnedAsteroids />
      <LastScannedAsteroids />
      <LastAsteroidTransfers />
    </div>
  )
}
