import { A, pipe } from '@mobily/ts-belt'
import { useContract, useContractWrite } from '@starknet-react/core'
import { isPast } from 'date-fns'
import { Activity } from 'influence-typed-sdk/api'
import { ArgsOrCalldataWithOptions } from 'starknet'
import { match } from 'ts-pattern'
import dispatcherAbi from './dispatcher-abi.json'

export const useFinishAll = (activities: Activity[]) => {
  const { contract } = useContract({
    abi: dispatcherAbi,
    address:
      '0x0422d33a3638dcc4c62e72e1d6942cd31eb643ef596ccac2351e0e21f6cd4bf4',
  })

  const getCalldata = (
    finishTimestamp: Date,
    data: ArgsOrCalldataWithOptions
  ) =>
    isPast(finishTimestamp)
      ? contract?.populateTransaction?.['run_system']?.(...data)
      : undefined

  const entity = (entity: { id: number; label: number }) => [
    entity.label,
    entity.id,
  ]
  const calls = pipe(
    activities,
    A.filterMap(({ event }) =>
      match(event)
        .with(
          { name: 'MaterialProcessingStarted' },
          ({
            returnValues: {
              finishTimestamp,
              processor,
              processorSlot,
              callerCrew,
            },
          }) =>
            getCalldata(finishTimestamp, [
              'ProcessProductsFinish',
              [...entity(processor), processorSlot, ...entity(callerCrew)],
            ])
        )
        .with(
          { name: 'ResourceExtractionStarted' },
          ({
            returnValues: {
              finishTimestamp,
              extractor,
              extractorSlot,
              callerCrew,
            },
          }) =>
            getCalldata(finishTimestamp, [
              'ExtractResourceFinish',
              [...entity(extractor), extractorSlot, ...entity(callerCrew)],
            ])
        )
        .with(
          { name: 'ConstructionStarted' },
          ({ returnValues: { finishTimestamp, building, callerCrew } }) =>
            getCalldata(finishTimestamp, [
              'ConstructionFinish',
              [...entity(building), ...entity(callerCrew)],
            ])
        )
        .otherwise(() => undefined)
    )
  )

  const { status, write } = useContractWrite({ calls })

  return {
    finishStatus: status,
    finishAll: write,
    activitiesToFinish: calls.length,
  }
}
