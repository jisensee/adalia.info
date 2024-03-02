import { Process, ProcessType, Product, ProductType } from '@influenceth/sdk'
import { Reducer, useReducer } from 'react'
import { getInOutputs } from '@/lib/influence-api'

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
  return {
    ...state,
    selectedInputs: getInputs(selectedProcesses),
    selectedProcesses: selectedProcesses.map((p) => p.i),
    selectedOutputs: getOutputs(selectedProcesses),
  }
}

const selectProcess = (state: State, process: ProcessType): State => ({
  ...state,
  selectedInputs: getInputs([process]),
  selectedProcesses: [process.i],
  selectedOutputs: getOutputs([process]),
})

const selectOutput = (state: State, productId: number): State => {
  const selectedProcesses = state.processes.filter((process) =>
    getInOutputs(process.outputs).includes(productId)
  )
  return {
    ...state,
    selectedInputs: getInputs(selectedProcesses),
    selectedProcesses: selectedProcesses.map((p) => p.i),
    selectedOutputs: getOutputs(selectedProcesses),
  }
}

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

  const outputProducts = [
    ...new Set(processes.flatMap((p) => getInOutputs(p.outputs))),
  ]
    .map(Product.getType)
    .map((p) => ({ product: p, amount: 0 }))

  return {
    inputProducts: hideWithoutProcesses
      ? removeWithoutProcesses(filteredProducts, processes)
      : filteredProducts,
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
