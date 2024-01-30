import { LastAsteroidPurchases } from './last-asteroid-purchases'
import { LastAsteroidTransfers } from './last-asteroid-transfers'
import { LastScannedAsteroids } from './last-scanned-asteroids'
import { OwnedAsteroids } from './owned-asteroids'
import { Separator } from '@/components/ui/separator'

export const revalidate = 60

export default async function Home() {
  return (
    <div className='flex flex-col gap-y-5 px-3'>
      <p className='text-center text-4xl'>
        Welcome to <span className='text-4xl text-primary'>adalia.info</span>!
      </p>
      <OwnedAsteroids />
      <Separator className='bg-primary' />
      <LastScannedAsteroids />
      <Separator className='bg-primary' />
      <LastAsteroidPurchases />
      <Separator className='bg-primary' />
      <LastAsteroidTransfers />
    </div>
  )
}
