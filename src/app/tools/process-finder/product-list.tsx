import { ProductType } from '@influenceth/sdk'
import { FC, ReactNode } from 'react'
import { ProductAmount } from './state'
import { ListEntry } from './list-entry'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Format } from '@/lib/format'
import { ProductIcon } from '@/components/influence-asset-icons'

type ProductListProps = {
  title: ReactNode
  products: ProductAmount[]
  selectedProducts: number[]
  onProductSelect?: (product: ProductType) => void
}

export const ProductList: FC<ProductListProps> = ({
  title,
  products,
  selectedProducts,
  onProductSelect,
}) => {
  return (
    <div>
      <h2>
        {products.length} {title}
      </h2>
      <div className='flex flex-col'>
        {products
          .sort((a, b) => a.product.name.localeCompare(b.product.name))
          .map(({ product, amount }) => (
            <HoverCard key={product.i}>
              <HoverCardTrigger onClick={() => onProductSelect?.(product)}>
                <ListEntry selected={selectedProducts.includes(product.i)}>
                  <div className='flex items-center gap-2'>
                    <ProductIcon product={product} size={24} />
                    {Format.productAmount(product, amount)}
                  </div>
                </ListEntry>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className='flex items-center gap-2'>
                  <ProductIcon product={product} size={64} />
                  <h3>{product.name}</h3>
                </div>
                <p>
                  Category:{' '}
                  <span className='text-primary'>{product.category}</span>
                </p>
                <p>
                  Type:{' '}
                  <span className='text-primary'>{product.classification}</span>
                </p>
              </HoverCardContent>
            </HoverCard>
          ))}
      </div>
    </div>
  )
}
