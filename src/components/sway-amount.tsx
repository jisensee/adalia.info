import NextImage from 'next/image'
import { FC } from 'react'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  sway: number
  large?: boolean
  colored?: boolean
}

export const SwayAmount: FC<SwayAmountProps> = ({ sway, large, colored }) => (
  <div className='flex items-center gap-x-2'>
    <span
      className={cn({
        'text-xl': large,
        'text-success': colored && sway > 0,
        'text-destructive': colored && sway < 0,
      })}
    >
      {Format.swayAmount(sway)}
    </span>
    <NextImage
      src='/sway-logo.png'
      width={large ? 25 : 20}
      height={large ? 25 : 20}
      alt='Sway'
    />
  </div>
)
