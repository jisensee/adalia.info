import { D } from '@mobily/ts-belt'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'
import { LotAbundances } from './hooks'
import { ResourceAbundanceList } from './resource-abundance-list'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export type AbundancesChartProps = {
  asteroidAbundances: LotAbundances[]
  selectedResource: number
}

export const AbundancesChart = ({
  asteroidAbundances,
  selectedResource,
}: AbundancesChartProps) => {
  return (
    <div className='space-y-3'>
      <ChartContainer className='max-h-[50vh] w-full' config={{}}>
        <BarChart data={asteroidAbundances} margin={{ left: 12, right: 12 }}>
          <XAxis dataKey='lotIndex' />
          {selectedResource > 0 && (
            <YAxis tickFormatter={(value) => (value * 100).toFixed(1) + '%'} />
          )}
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator='dot'
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
