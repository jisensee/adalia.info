import { Process, ProcessType, Product, ProductType } from '@influenceth/sdk'
import { Reducer, useReducer } from 'react'
import {
  ProductAmount,
  getInOutputs,
  reduceProductAmounts,
} from 'influence-typed-sdk/api'
import { groupArrayBy } from '@/lib/utils'

export type Warehouse = {
  id: number
  name: string
  asteroid: string
  products: ProductAmount[]
}

type ProcessFinderSettings = {
  hideLowAmounts: boolean
  hideWithoutProcesses: boolean
  restrictToAsteroid: boolean
  warehouses?: number[]
  processors?: number[]
}

type State = {
  selectedInputs: number[]
  selectedOutputs: number[]
  selectedProcesses: number[]
  warehouses: Warehouse[]
  inputProducts: ProductAmount[]
  allProcessors: number[]
  processes: ProcessType[]
  outputProducts: ProductAmount[]
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

type ApplySettings = {
  type: 'apply-settings'
  settings: ProcessFinderSettings
}

type Action = SelectInput | SelectOutput | SelectProcess | ApplySettings

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'select-input':
      return selectInput(state, action.productId)
    case 'select-output':
      return selectOutput(state, action.productId)
    case 'select-process':
      return selectProcess(state, action.process)
    case 'apply-settings':
      return {
        ...state,
        selectedInputs: [],
        selectedOutputs: [],
        selectedProcesses: [],
        ...calcProcessFinderState(state.warehouses, action.settings),
      }
  }
}

const getInputs = (processes: ProcessType[]) => [
  ...new Set(processes.flatMap((p) => getInOutputs(p.inputs))),
]

const getOutputs = (processes: ProcessType[]) => [
  ...new Set(processes.flatMap((p) => getInOutputs(p.outputs ?? {}))),
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
) => allOutputs.map((o) => overrides.find((s) => s.product === o.product) ?? o)

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
    getInOutputs(process.outputs ?? {}).includes(productId)
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
          inputs.find((p) => p.product === parseInt(processInput))?.amount ?? 0
        return Math.floor(input / inputAmount)
      })
      .sort((a, b) => a - b)[0] ?? 0

  return Object.entries(process.outputs ?? {}).map(([id, a]) => ({
    product: parseInt(id),
    amount: a * maxRecipes,
  }))
}

const collapseOutputAmounts = (outputProducts: ProductAmount[]) =>
  [...groupArrayBy(outputProducts, (o) => o.product).values()].flatMap((o) => {
    const r = o.sort((a, b) => b.amount - a.amount)[0]
    return r ? [r] : []
  })

export const useProcessFinderState = (
  warehouses: Warehouse[],
  settings: ProcessFinderSettings
) =>
  useReducer(reducer, {
    selectedInputs: [],
    selectedOutputs: [],
    selectedProcesses: [],
    warehouses,
    ...calcProcessFinderState(warehouses, settings),
  })

const calcProcessFinderState = (
  warehouses: Warehouse[],
  {
    hideLowAmounts,
    hideWithoutProcesses,
    restrictToAsteroid,
    warehouses: selectedWarehouseIds,
    processors,
  }: ProcessFinderSettings
) => {
  const selectedWarehouses = warehouses.filter(
    (w) => selectedWarehouseIds?.includes(w.id) ?? true
  )
  const groupedWarehouses = restrictToAsteroid
    ? [...groupArrayBy(selectedWarehouses, (w) => w.asteroid).values()]
    : [selectedWarehouses]

  const groupedProducts = groupedWarehouses.map((warehouses) =>
    reduceProductAmounts(
      warehouses.flatMap((warehouse) => warehouse.products)
    ).filter((p) => (hideLowAmounts ? !isLowAmount(p) : true))
  )

  const processData = groupedProducts.map((products) => {
    const ids = new Set(products.map((p) => p.product))
    const allProcesses = Object.values(Process.TYPES).filter((t) =>
      getInOutputs(t.inputs).every((inputId) => ids.has(inputId))
    )
    const allProcessors = [
      ...new Set(allProcesses.map((p) => p.processorType)),
    ].sort()
    const processes = allProcesses.filter((p) =>
      processors ? processors.includes(p.processorType) : true
    )

    const outputProducts = collapseOutputAmounts(
      [
        ...new Set(
          processes.flatMap((p) => (p.outputs ? getInOutputs(p.outputs) : []))
        ),
      ]
        .map(Product.getType)
        .flatMap((p) => {
          const producingProcesses = processes.filter((process) =>
            process.outputs
              ? getInOutputs(process.outputs).includes(p.i)
              : false
          )

          return producingProcesses.flatMap((process) => {
            const inputs = products.filter((p) =>
              getInOutputs(process.inputs).includes(p.product)
            )
            return getOutputAmounts(process, inputs)
          })
        })
    )
    return { processes, outputProducts, allProcessors }
  })

  const processes = [
    ...new Set(
      processData.flatMap(({ processes }) => processes).map((p) => p.i)
    ),
  ].map(Process.getType)
  const outputProducts = collapseOutputAmounts(
    processData.flatMap(({ outputProducts }) => outputProducts)
  )
  const allProcessors = [
    ...new Set(processData.flatMap(({ allProcessors }) => allProcessors)),
  ]

  const allProducts = reduceProductAmounts(groupedProducts.flat())
  const inputProducts = hideWithoutProcesses
    ? removeWithoutProcesses(allProducts, processes)
    : allProducts

  return {
    inputProducts,
    processes,
    outputProducts,
    allProcessors,
  }
}

const removeWithoutProcesses = (
  products: ProductAmount[],
  processes: ProcessType[]
) => {
  const processInputIds = new Set(
    processes.flatMap((p) => getInOutputs(p.inputs))
  )
  return products.filter((p) => processInputIds.has(p.product))
}

const getLowProductThreshold = (product: ProductType) => {
  const atomicProducts: number[] = [
    Product.IDS.PLATINUM,
    Product.IDS.GOLD,
    Product.IDS.SILVER,
    Product.IDS.COMPUTER,
    Product.IDS.COMPUTER_CHIP,
    Product.IDS.CIRCUIT_BOARD,
    Product.IDS.BARE_CIRCUIT_BOARD,
  ]
  if (atomicProducts.includes(product.i)) {
    return 1
  }

  switch (product.classification) {
    case 'Raw Material':
      return 100_000
  }

  return 1_000
}

const isLowAmount = ({ product, amount }: ProductAmount) => {
  const productType = Product.getType(product)
  if (amount === 0 || productType.isAtomic) {
    return false
  }

  return amount < getLowProductThreshold(productType)
}
