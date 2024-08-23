import { Product } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { ProductIcon } from '@/components/influence-asset-icons'
import { Abundance } from '@/components/abundance'

export type ResourceAbundanceListProps = {
  abundances: Record<number, number>
  highlightedResource?: number
  color?: boolean
}
export const ResourceAbundanceList = ({
  abundances,
  highlightedResource,
  color,
}: ResourceAbundanceListProps) => {
  const resources = D.keys(abundances)
  return (
    <div className='grid h-fit grid-cols-[max-content,1fr] gap-x-5 gap-y-1'>
      {pipe(
        resources,
        A.sortBy((r) =>
          highlightedResource === r ? 0 : 1 - (abundances[r] ?? 0)
        ),
        A.filterMap((resource) => {
          const abundance = abundances[resource] as number
          return abundance > 0 ? (
            <Fragment key={resource}>
              <div
                className={cn('flex w-fit items-center gap-1', {
                  'text-primary': highlightedResource === resource,
                })}
              >
                <ProductIcon product={resource} size={24} />
                <span>{Product.getType(resource).name}</span>
              </div>
              <Abundance abundance={abundance} color={color} />
            </Fragment>
          ) : null
        })
      )}
    </div>
  )
}
