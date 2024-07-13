import NextImage from 'next/image'
import { FC } from 'react'
import { cn } from '@/lib/utils'
import { influenceImages } from '@/lib/influence-api/api'

export type ProductIconProps = {
  className?: string
  product: number
  size: number
}

export const ProductIcon: FC<ProductIconProps> = ({
  className,
  product,
  size,
}) => (
  <NextImage
    src={influenceImages.product(product, { w: size, h: size })}
    alt={`product ${product}`}
    width={size}
    height={size}
    className={className}
  />
)

export type ProductIconGroupProps = {
  products: number[]
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
      <ProductIcon key={product} product={product} size={size} />
    ))}
  </div>
)

export type BuildingIconProps = {
  className?: string
  building: number
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
    alt={`building ${building}`}
    width={size}
    height={size}
    className={className}
  />
)
