'use client'

import { FC, useEffect } from 'react'
import { useQueryStates } from 'nuqs'
import { ProductList } from './product-list'
import { ProcessList } from './process-list'
import { ProductAmount, useProcessFinderState } from './state'
import { settingsParams } from './params'

type ProcessFinderResultsProps = {
  warehouseProducts: ProductAmount[]
}

export const ProcessFinderResults: FC<ProcessFinderResultsProps> = ({
  warehouseProducts,
}) => {
  const [settings] = useQueryStates(settingsParams)

  const [state, dispatch] = useProcessFinderState({
    warehouseProducts,
    settings: settings,
  })

  useEffect(() => {
    dispatch({ type: 'set-warehouse-products', warehouseProducts, settings })
  }, [dispatch, settings, warehouseProducts])

  return (
    <div className='flex gap-x-10 overflow-x-auto'>
      <ProductList
        title='Warehouse products'
        products={state.inputProducts}
        selectedProducts={state.selectedInputs}
        onProductSelect={({ i }) =>
          dispatch({ type: 'select-input', productId: i })
        }
      />
      <ProcessList
        processes={state.processes}
        selectedProcesses={state.selectedProcesses}
        onProcessSelect={(p) =>
          dispatch({ type: 'select-process', process: p })
        }
      />
      <ProductList
        title='Possible outputs'
        products={state.outputProducts}
        selectedProducts={state.selectedOutputs}
        onProductSelect={({ i }) =>
          dispatch({ type: 'select-output', productId: i })
        }
      />
    </div>
  )
}
