import { Process, ProcessType, Product, ProductType } from '@influenceth/sdk'
import { Reducer, useReducer } from 'react'
import { getInOutputs } from '@/lib/influence-api'
import { groupArrayBy } from '@/lib/utils'

type ProcessFinderSettings = {
  hideLowAmounts: boolean
  hideWithoutProcesses: boolean
}

type State = {
  selectedInputs: number[]
  selectedOutputs: number[]
  selectedProcesses: number[]
  inputProducts: ProductAmount[]
  processes: ProcessType[]
  outputProducts: ProductAmount[]
}

export type ProductAmount = {
  product: ProductType
  amount: number
}

type SelectInput = {
  type: 'select-input'
  productId: number
}

type SelectOutput = {
  type: 'select-output'
  productId: number
}

type SelectProcess = {
  type: 'select-process'
  process: ProcessType
}

type SetWarehouseProducts = {
  type: 'set-warehouse-products'
  warehouseProducts: ProductAmount[]
  settings: ProcessFinderSettings
}

type Action = SelectInput | SelectOutput | SelectProcess | SetWarehouseProducts

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'select-input':
      return selectInput(state, action.productId)
    case 'select-output':
      return selectOutput(state, action.productId)
    case 'select-process':
      return selectProcess(state, action.process)
    case 'set-warehouse-products':
      return {
        selectedInputs: [],
        selectedOutputs: [],
        selectedProcesses: [],
        ...calcProcessFinderState(action.warehouseProducts, action.settings),
      }
  }
}

const getInputs = (processes: ProcessType[]) => [
  ...new Set(processes.flatMap((p) => getInOutputs(p.inputs))),
]

const getOutputs = (processes: ProcessType[]) => [
  ...new Set(processes.flatMap((p) => getInOutputs(p.outputs))),
]

const selectInput = (state: State, productId: number): State => {
  const selectedProcesses = state.processes.filter((process) =>
    getInOutputs(process.inputs).includes(productId)
  )
  const allOutputs = calcOutputs(state.processes, state.inputProducts)
  const selectedOutputs = calcOutputs(selectedProcesses, state.inputProducts)
  return {
    ...state,
    outputProducts: mergeOutputs(allOutputs, selectedOutputs),
    selectedInputs: getInputs(selectedProcesses),
    selectedProcesses: selectedProcesses.map((p) => p.i),
    selectedOutputs: getOutputs(selectedProcesses),
  }
}

const calcOutputs = (processes: ProcessType[], inputs: ProductAmount[]) =>
  collapseOutputAmounts(processes.flatMap((p) => getOutputAmounts(p, inputs)))

const mergeOutputs = (
  allOutputs: ProductAmount[],
  overrides: ProductAmount[]
) =>
  allOutputs.map((o) => overrides.find((s) => s.product.i === o.product.i) ?? o)

const selectProcess = (state: State, process: ProcessType): State => {
  const allOutputs = calcOutputs(state.processes, state.inputProducts)
  const selectedOutputs = calcOutputs([process], state.inputProducts)
  return {
    ...state,
    outputProducts: mergeOutputs(allOutputs, selectedOutputs),
    selectedInputs: getInputs([process]),
    selectedProcesses: [process.i],
    selectedOutputs: getOutputs([process]),
  }
}

const selectOutput = (state: State, productId: number): State => {
  const selectedProcesses = state.processes.filter((process) =>
    getInOutputs(process.outputs).includes(productId)
  )
  const allOutputs = calcOutputs(state.processes, state.inputProducts)
  const selectedOutputs = calcOutputs(selectedProcesses, state.inputProducts)
  return {
    ...state,
    outputProducts: mergeOutputs(allOutputs, selectedOutputs),
    selectedInputs: getInputs(selectedProcesses),
    selectedProcesses: selectedProcesses.map((p) => p.i),
    selectedOutputs: getOutputs(selectedProcesses),
  }
}

const getOutputAmounts = (process: ProcessType, inputs: ProductAmount[]) => {
  const maxRecipes =
    Object.entries(process.inputs)
      .map(([processInput, inputAmount]) => {
        const input =
          inputs.find((p) => p.product.i === parseInt(processInput))?.amount ??
          0
        return Math.floor(input / inputAmount)
      })
      .toSorted((a, b) => a - b)[0] ?? 0

  return Object.entries(process.outputs).map(([id, a]) => ({
    product: Product.getType(parseInt(id)),
    amount: a * maxRecipes,
  }))
}

const collapseOutputAmounts = (outputProducts: ProductAmount[]) =>
  [...groupArrayBy(outputProducts, (o) => o.product.i).values()].flatMap(
    (o) => {
      const r = o.toSorted((a, b) => b.amount - a.amount)[0]
      return r ? [r] : []
    }
  )

export const useProcessFinderState = ({
  warehouseProducts,
  settings,
}: Omit<SetWarehouseProducts, 'type'>) =>
  useReducer(reducer, {
    selectedInputs: [],
    selectedOutputs: [],
    selectedProcesses: [],
    ...calcProcessFinderState(warehouseProducts, settings),
  })

const calcProcessFinderState = (
  warehouseProducts: ProductAmount[],
  { hideLowAmounts, hideWithoutProcesses }: ProcessFinderSettings
) => {
  const filteredProducts = hideLowAmounts
    ? warehouseProducts.filter((p) => !isLowAmount(p))
    : warehouseProducts
  const productIds = new Set(filteredProducts.map((p) => p.product.i))

  const processes = Object.values(Process.TYPES).filter((t) =>
    getInOutputs(t.inputs).every((inputId) => productIds.has(inputId))
  )

  const inputProducts = hideWithoutProcesses
    ? removeWithoutProcesses(filteredProducts, processes)
    : filteredProducts

  const outputProducts = collapseOutputAmounts(
    [...new Set(processes.flatMap((p) => getInOutputs(p.outputs)))]
      .map(Product.getType)
      .flatMap((p) => {
        const producingProcesses = processes.filter((process) =>
          getInOutputs(process.outputs).includes(p.i)
        )

        return producingProcesses.flatMap((process) => {
          const inputs = inputProducts.filter((p) =>
            getInOutputs(process.inputs).includes(p.product.i)
          )
          return getOutputAmounts(process, inputs)
        })
      })
  )

  return {
    inputProducts,
    processes,
    outputProducts,
  }
}

const removeWithoutProcesses = (
  products: ProductAmount[],
  processes: ProcessType[]
) => {
  const processInputIds = new Set(
    processes.flatMap((p) => getInOutputs(p.inputs))
  )
  return products.filter((p) => processInputIds.has(p.product.i))
}

const getLowProductThreshold = (product: ProductType) => {
  switch (product.i) {
    case Product.IDS.PLATINUM:
      return 1
  }

  switch (product.classification) {
    case 'Raw Material':
      return 100_000
  }

  return 1_000
}

const isLowAmount = ({ product, amount }: ProductAmount) => {
  if (amount === 0 || product.isAtomic) {
    return false
  }

  return amount < getLowProductThreshold(product)
}
