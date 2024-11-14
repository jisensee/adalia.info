import { Trophy } from 'lucide-react'
import { Race } from './data'
import { SwayAmount } from '@/components/sway-amount'
import { cn } from '@/lib/utils'

export type PricePoolProps = {
  race: Race
}

export const PricePool = ({ race }: PricePoolProps) => {
  return (
    <div className='flex flex-col items-center gap-y-2'>
      <PriceEntry place={1} swayAmount={race.firstPrice} allDigits />
      <div className='flex gap-x-5'>
        <PriceEntry place={2} swayAmount={race.secondPrice} allDigits />
        <PriceEntry place={3} swayAmount={race.thirdPrice} allDigits />
      </div>
    </div>
  )
}

export type PriceEntryProps = {
  className?: string
  place: 1 | 2 | 3
  swayAmount: number
  allDigits?: boolean
}
export const PriceEntry = ({
  className,
  place,
  swayAmount,
  allDigits,
}: PriceEntryProps) => (
  <div className={cn('flex items-center gap-x-2', className)}>
    <Trophy className={getPlaceColor(place)} />
    <SwayAmount sway={swayAmount * 1e6} allDigits={allDigits} />
  </div>
)

export const getPlaceColor = (place: number) =>
  ['text-yellow-400', 'text-slate-400', 'text-amber-700'][place - 1]
