import { Building, Process, Processor, Product } from '@influenceth/sdk'
import { groupArrayBy } from '../utils'
import { ProductAmount } from './types'

export const getInOutputs = (inOrOutputs: Record<number, number>) =>
  Object.keys(inOrOutputs).map((i) => parseInt(i, 10))

export const getOutputAmounts = (
  processId: number,
  outputProductId: number,
  recipes: number,
  secondaryEff: number
): ProductAmount[] =>
  Object.entries(Process.getType(processId).outputs).map(
    ([productId, amount]) => ({
      product: Product.getType(parseInt(productId, 10)),
      amount:
        amount *
        recipes *
        (productId === outputProductId.toString() ? 1 : secondaryEff),
    })
  )

/**
 * Sum up all amounts of the same products in the given array. Returns each product only once.
 */
export const reduceProductAmounts = (
  amounts: ProductAmount[]
): ProductAmount[] =>
  [...groupArrayBy(amounts, (a) => a.product.i).entries()].map(
    ([productId, amounts]) => ({
      product: Product.getType(productId),
      amount: amounts.reduce((acc, a) => acc + a.amount, 0),
    })
  )

export const processorToBuilding = (processorType: number) => {
  switch (processorType) {
    case Processor.IDS.REFINERY:
      return Building.getType(Building.IDS.REFINERY)
    case Processor.IDS.FACTORY:
      return Building.getType(Building.IDS.FACTORY)
    case Processor.IDS.SHIPYARD:
      return Building.getType(Building.IDS.SHIPYARD)
    case Processor.IDS.BIOREACTOR:
    default:
      return Building.getType(Building.IDS.BIOREACTOR)
  }
}
