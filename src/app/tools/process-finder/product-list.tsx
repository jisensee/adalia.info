import { Product } from '@influenceth/sdk'
import { FC, ReactNode } from 'react'
import { ProductAmount } from 'influence-typed-sdk/api'
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
  onProductSelect?: (product: number) => void
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
          .sort((a, b) =>
            Product.getType(a.product).name.localeCompare(
              Product.getType(b.product).name
            )
          )
          .map(({ product, amount }) => {
            const productType = Product.getType(product)
            return (
              <HoverCard key={product}>
                <HoverCardTrigger onClick={() => onProductSelect?.(product)}>
                  <ListEntry selected={selectedProducts.includes(product)}>
                    <div className='flex items-center gap-2'>
                      <ProductIcon product={product} size={24} />
                      {Format.productAmount(product, amount)}
                    </div>
                  </ListEntry>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className='flex items-center gap-2'>
                    <ProductIcon product={product} size={64} />
                    <h3>{productType.name}</h3>
                  </div>
                  <p>
                    Category:{' '}
                    <span className='text-primary'>{productType.category}</span>
                  </p>
                  <p>
                    Type:{' '}
                    <span className='text-primary'>
                      {productType.classification}
                    </span>
                  </p>
                </HoverCardContent>
              </HoverCard>
            )
          })}
      </div>
    </div>
  )
}
