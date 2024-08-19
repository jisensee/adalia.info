import { D } from '@mobily/ts-belt'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { useEffect, useState } from 'react'
import { LotAbundances } from './hooks'
import { ResourceAbundanceList } from './resource-abundance-list'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type AbundancesChartProps = {
  asteroidAbundances: LotAbundances[]
  selectedResource: number
}

export const AbundancesChart = ({
  asteroidAbundances,
  selectedResource,
}: AbundancesChartProps) => {
  const [copiedLot, setCopiedLot] = useState<number>()

  const onLotCopy = (lot: number) => {
    navigator.clipboard.writeText(lot.toString())
    setCopiedLot(lot)
  }

  useEffect(() => {
    if (copiedLot) {
      const timeout = setTimeout(() => setCopiedLot(undefined), 3_000)
      return () => clearTimeout(timeout)
    }
  }, [copiedLot])

  return (
    <div className='space-y-3'>
      <TooltipProvider>
        <Tooltip open={!!copiedLot}>
          <TooltipTrigger>
            <p className='italic'>
              Hover over a bar to see the abundances for that lot. Click it to
              copy the lot number to your clipboard.
            </p>
          </TooltipTrigger>
          <TooltipContent>Lot number copied to your clipboard.</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ChartContainer className='max-h-[50vh] w-full' config={{}}>
        <BarChart
          data={asteroidAbundances}
          margin={{ left: 12, right: 12 }}
          onClick={(d) => d.activeLabel && onLotCopy(parseInt(d.activeLabel))}
        >
          <XAxis dataKey='lotIndex' />
          {selectedResource > 0 && (
            <YAxis tickFormatter={(value) => (value * 100).toFixed(1) + '%'} />
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(_value, _name, item) => {
                  const abundances = item.payload as LotAbundances
                  return (
                    <div className='space-y-3'>
                      <h2>#{abundances.lotIndex.toLocaleString()}</h2>
                      <ResourceAbundanceList
                        abundances={D.deleteKeys(abundances, [
                          'lotIndex',
                          'summedAbundances',
                        ])}
                        highlightedResource={selectedResource}
                        color
                      />
                    </div>
                  )
                }}
              />
            }
          />
          <Bar
            dataKey={
              selectedResource > 0 ? selectedResource : 'summedAbundances'
            }
            fill='var(--primary)'
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
