import { FC } from 'react'
import { ProcessType, Processor, Product } from '@influenceth/sdk'
import { ListEntry } from './list-entry'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { getInOutputs } from '@/lib/influence-api'
import { Format } from '@/lib/format'

type ProcessListProps = {
  processes: ProcessType[]
  selectedProcesses: number[]
  onProcessSelect: (process: ProcessType) => void
}

export const ProcessList: FC<ProcessListProps> = ({
  processes,
  selectedProcesses,
  onProcessSelect,
}) => (
  <div>
    <h2>{processes.length} Possible Processes</h2>
    {groupProcesses(processes).map(({ processor, processes }) => (
      <div key={processor}>
        <p className='text-lg text-primary'>{processor}</p>
        <div className='flex flex-col'>
          {processes.map((p) => {
            const inputProducts = getInOutputs(p.inputs).map(Product.getType)
            const outputProducts = getInOutputs(p.outputs).map(Product.getType)
            return (
              <HoverCard key={p.i}>
                <HoverCardTrigger onClick={() => onProcessSelect(p)}>
                  <ListEntry selected={selectedProcesses.includes(p.i)}>
                    {p.name}
                  </ListEntry>
                </HoverCardTrigger>
                <HoverCardContent className='w-96'>
                  <h3>{p.name}</h3>
                  <p>
                    <span className='text-primary'>Inputs:</span>{' '}
                    {inputProducts.map((p) => p.name).join(', ')}
                  </p>
                  <p>
                    <span className='text-primary'>Outputs:</span>{' '}
                    {outputProducts.map((p) => p.name).join(', ')}
                  </p>
                </HoverCardContent>
              </HoverCard>
            )
          })}
        </div>
      </div>
    ))}
  </div>
)

const groupProcesses = (processes: ProcessType[]) => {
  const types = [
    Processor.IDS.REFINERY,
    Processor.IDS.FACTORY,
    Processor.IDS.BIOREACTOR,
    Processor.IDS.SHIPYARD,
    Processor.IDS.DRY_DOCK,
  ]
  return types
    .map(
      (t) =>
        ({
          processor: Format.processor(t),
          processes: processes
            .filter((p) => p.processorType === t)
            .toSorted((a, b) => a.name.localeCompare(b.name)),
        }) as const
    )
    .filter((g) => g.processes.length > 0)
}
