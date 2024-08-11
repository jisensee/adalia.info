import { A, F, pipe } from '@mobily/ts-belt'

export const getProductFloorPrice = (
  floorPrices: Map<number, Map<number, number>>,
  asteroidId: number,
  product: number
) => {
  const productFloorPrice = floorPrices.get(asteroidId)?.get(product)
  if (productFloorPrice) return productFloorPrice

  // Fallback to other asteroids if product is not found on given asteroid
  return (
    pipe(
      [...floorPrices.values()],
      A.filterMap((prices) => prices.get(product)),
      A.sortBy(F.identity),
      A.head
    ) ?? 0
  )
}
