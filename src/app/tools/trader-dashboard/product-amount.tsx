import { ProductType } from '@influenceth/sdk'
import { FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ProductIcon } from '@/components/influence-asset-icons'

export type ProductAmountProps = {
  product: ProductType
  amount: number
  hideBadges?: boolean
  hideIcon?: boolean
  className?: string
}

export const ProductAmount: FC<ProductAmountProps> = ({
  product,
  amount,
  hideBadges,
  hideIcon,
  className,
}) => (
  <div className={cn('flex flex-row items-center gap-x-2', className)}>
    {!hideIcon && <ProductIcon product={product} size={24} />}
    <span>
      <span className='font-bold text-primary'>
        {product.isAtomic ? amount.toLocaleString() : Format.mass(amount)}
      </span>{' '}
      {product.name}
    </span>
    {!hideBadges && (
      <>
        <Badge className='hidden md:inline' variant='outline'>
          {product.classification}
        </Badge>
        <Badge className='hidden md:inline' variant='outline'>
          {product.category}
        </Badge>
      </>
    )}
  </div>
)
