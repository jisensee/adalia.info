import { ProductType } from '@influenceth/sdk'
import { FC, ReactNode } from 'react'
import { ProductAmount } from './state'
import { ListEntry } from './list-entry'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

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
          .toSorted((a, b) => a.product.name.localeCompare(b.product.name))
          .map(({ product, amount }) => (
            <HoverCard key={product.i}>
              <HoverCardTrigger onClick={() => onProductSelect?.(product)}>
                <ListEntry selected={selectedProducts.includes(product.i)}>
                  {formatProductAmount({ product, amount })}
                </ListEntry>
              </HoverCardTrigger>
              <HoverCardContent>
                <h3>{product.name}</h3>
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

const formatProductAmount = ({ product, amount }: ProductAmount) => {
  if (amount === 0) {
    return product.name
  }
  if (product.isAtomic) {
    return `${amount} ${product.name}`
  }
  return `${formatAmount(amount)} ${product.name}`
}

const formatAmount = (amount: number) => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}kt`
  }
  if (amount >= 1_000) {
    return `${(amount / 1000).toFixed()}t`
  }
  return `${amount}kg`
}
