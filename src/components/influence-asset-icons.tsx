import { BuildingType, ProductType } from '@influenceth/sdk'
import NextImage from 'next/image'
import { FC } from 'react'
import { cn } from '@/lib/utils'
import { influenceImages } from '@/lib/influence-api/api'

export type ProductIconProps = {
  className?: string
  product: ProductType
  size: number
}

export const ProductIcon: FC<ProductIconProps> = ({
  className,
  product,
  size,
}) => (
  <NextImage
    src={influenceImages.product(product, { w: size, h: size })}
    alt={product.name}
    width={size}
    height={size}
    className={className}
  />
)

export type ProductIconGroupProps = {
  products: ProductType[]
  className?: string
  size: number
}

export const ProductIconGroup: FC<ProductIconGroupProps> = ({
  className,
  products,
  size,
}) => (
  <div className={cn('flex', className)}>
    {products.map((product) => (
      <ProductIcon key={product.i} product={product} size={size} />
    ))}
  </div>
)

export type BuildingIconProps = {
  className?: string
  building: BuildingType
  size: number
  isHologram?: boolean
}

export const BuildingIcon: FC<BuildingIconProps> = ({
  className,
  building,
  size,
  isHologram,
}) => (
  <NextImage
    src={influenceImages.building(building, { w: size }, isHologram)}
    alt={building.name}
    width={size}
    height={size}
    className={className}
  />
)
