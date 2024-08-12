import NextImage from 'next/image'
import { FC } from 'react'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'

type SwayAmountProps = {
  className?: string
  sway: number
  large?: boolean
  colored?: boolean
  noDecimals?: boolean
  allDigits?: boolean
}

export const SwayAmount: FC<SwayAmountProps> = ({
  className,
  sway,
  large,
  colored,
  noDecimals,
  allDigits,
}) => (
  <div className={cn('flex items-center gap-x-1', className)}>
    <NextImage
      src='/sway-logo.png'
      width={large ? 25 : 20}
      height={large ? 25 : 20}
      alt='Sway'
    />
    <span
      className={cn({
        'text-xl': large,
        'text-success': colored && sway > 0,
        'text-destructive': colored && sway < 0,
      })}
    >
      {allDigits
        ? (sway / 1e6).toLocaleString()
        : Format.swayAmount(sway, noDecimals)}
    </span>
  </div>
)
