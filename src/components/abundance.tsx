import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'

export type AbundanceProps = {
  abundance: number
  color?: boolean
}

export const Abundance = ({ abundance, color }: AbundanceProps) => {
  return (
    <span
      className={cn({
        'text-success': abundance >= 0.75 && color,
        'text-warning': abundance >= 0.25 && abundance < 0.75 && color,
      })}
    >
      {Format.abundance(abundance)}
    </span>
  )
}
