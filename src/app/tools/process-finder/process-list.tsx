import { FC, useEffect, useState } from 'react'
import { ProcessType, Product } from '@influenceth/sdk'
import { AccordionItem } from '@radix-ui/react-accordion'
import { useQueryStates } from 'nuqs'
import { getInOutputs } from 'influence-typed-sdk/api'
import { ListEntry } from './list-entry'
import { settingsParams } from './params'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Format } from '@/lib/format'
import { ProductIconGroup } from '@/components/influence-asset-icons'
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'

type ProcessListProps = {
  allProcessors: number[]
  processes: ProcessType[]
  selectedProcesses: number[]
  onProcessSelect: (process: ProcessType) => void
}

export const ProcessList: FC<ProcessListProps> = ({
  processes,
  allProcessors,
  selectedProcesses,
  onProcessSelect,
}) => {
  const [{ processors }, setParams] = useQueryStates(settingsParams)
  const [openProcessors, setOpenProcessors] = useState(
    (processors ?? allProcessors).map(String)
  )
  const groupedProcesses = allProcessors.map(
    (processor) =>
      [
        processor,
        processes.filter((p) => p.processorType === processor),
      ] as const
  )

  useEffect(() => {
    setParams({ processors: openProcessors.map(Number) })
  }, [openProcessors, setParams])

  return (
    <div>
      <h2>{processes.length} Possible Processes</h2>
      <Accordion
        type='multiple'
        value={openProcessors}
        onValueChange={setOpenProcessors}
      >
        {groupedProcesses.map(([processor, processes]) => (
          <AccordionItem key={processor} value={processor.toString()}>
            <AccordionTrigger>{Format.processor(processor)}</AccordionTrigger>
            <AccordionContent>
              <div className='flex flex-col'>
                {processes
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => {
                    const inputProducts = getInOutputs(p.inputs).map(
                      Product.getType
                    )
                    const outputProducts = getInOutputs(p.outputs).map(
                      Product.getType
                    )
                    return (
                      <HoverCard key={p.i}>
                        <HoverCardTrigger onClick={() => onProcessSelect(p)}>
                          <ListEntry selected={selectedProcesses.includes(p.i)}>
                            <div className='flex items-center gap-2'>
                              {p.name}
                              <ProductIconGroup
                                products={outputProducts}
                                size={24}
                              />
                            </div>
                          </ListEntry>
                        </HoverCardTrigger>
                        <HoverCardContent className='w-96'>
                          <h3>{p.name}</h3>
                          <div className='flex items-center gap-2'>
                            <span className='text-primary'>Inputs:</span>{' '}
                            <ProductIconGroup
                              products={inputProducts}
                              size={32}
                            />
                          </div>
                          <p>{inputProducts.map((p) => p.name).join(', ')}</p>
                          <div className='flex items-center gap-2'>
                            <span className='text-primary'>Outputs:</span>{' '}
                            <ProductIconGroup
                              products={outputProducts}
                              size={32}
                            />
                          </div>
                          <p>{outputProducts.map((p) => p.name).join(', ')}</p>
                        </HoverCardContent>
                      </HoverCard>
                    )
                  })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
