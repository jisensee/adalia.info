'use client'

import { FC, useEffect, useMemo } from 'react'
import { useQueryStates } from 'nuqs'
import { ProductList } from './product-list'
import { ProcessList } from './process-list'
import { Warehouse, useProcessFinderState } from './state'
import { settingsParams } from './params'

type ProcessFinderResultsProps = {
  warehouses: Warehouse[]
}

export const ProcessFinderResults: FC<ProcessFinderResultsProps> = ({
  warehouses,
}) => {
  const [settings] = useQueryStates(settingsParams)

  const processFinderSettings = useMemo(
    () => ({
      hideLowAmounts: settings.hideLowAmounts ?? false,
      hideWithoutProcesses: settings.hideWithoutProcesses ?? false,
      warehouses: settings.warehouses ?? undefined,
      processors: settings.processors ?? undefined,
      restrictToAsteroid: settings.restrictToAsteroid ?? false,
    }),
    [settings]
  )

  const [state, dispatch] = useProcessFinderState(
    warehouses,
    processFinderSettings
  )

  useEffect(() => {
    dispatch({ type: 'apply-settings', settings: processFinderSettings })
  }, [dispatch, processFinderSettings])

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
        allProcessors={state.allProcessors}
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
