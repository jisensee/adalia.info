import { Assets, BuildingType, ProductType } from '@influenceth/sdk'

const BUCKET = 'unstoppablegames'
const CLOUDFRONT_URL = `https://${process.env.NEXT_PUBLIC_INFLUENCE_CLOUDFRONT_IMAGE_HOST}`

export const PRODUCT_SIZES = {
  w25: { w: 25 },
  w85: { w: 85 },
  w125: { w: 125 },
  w400: { w: 400 },
}

export const BUILDING_SIZES = {
  w150: { w: 150 },
  w400: { w: 400 },
  w1000: { w: 1000 },
}

type Edits = {
  w?: number
  h?: number
  f?: string
}

export const getCloudfrontUrl = (rawSlug: string, { w, h, f }: Edits = {}) => {
  const slug =
    w || h
      ? btoa(
          JSON.stringify({
            key: rawSlug,
            bucket: BUCKET,
            edits: {
              resize: {
                width: w,
                height: h,
                fit: f,
              },
            },
          })
        )
      : rawSlug
  return `${CLOUDFRONT_URL}/${slug}`
}

const getSlug = (assetName: string) => {
  return (assetName || '').replace(/[^a-z]/gi, '')
}

const getIconUrl = (
  type: string,
  assetName: string,
  iconVersion: number,
  { append, w, h, f }: Edits & { append?: string } = {}
) => {
  const environment =
    process.env.NODE_ENV === 'production' ? 'production' : 'staging'
  return getCloudfrontUrl(
    `influence/${environment}/images/icons/${type}/${getSlug(assetName)}${append || ''}.v${iconVersion || '1'}.png`,
    { w, h, f }
  )
}

export const getProductImageUrl = (
  product: ProductType,
  size: keyof typeof PRODUCT_SIZES
) =>
  getIconUrl(
    'resources',
    product.name,
    Assets.Product[product.i]?.iconVersion ?? 0,
    PRODUCT_SIZES[size]
  )

export const getBuildingImageUrl = (
  building: BuildingType,
  size: keyof typeof BUILDING_SIZES,
  isHologram = false
) =>
  getIconUrl(
    'buildings',
    building.name,
    Assets.Building[building.i]?.iconVersion ?? 0,
    { ...BUILDING_SIZES[size], append: isHologram ? '_Site' : undefined }
  )
