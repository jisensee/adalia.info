import { Product } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { chartColors } from '@/lib/colors'

export type AbundancesChartProps = {
  abundances: Record<number, number>
}

export const AbundancesChart = ({ abundances }: AbundancesChartProps) => {
  const chartData = pipe(
    abundances,
    D.toPairs,
    A.filter(([, abundance]) => abundance > 0),
    A.sortBy(([, abundance]) => -abundance),
    A.mapWithIndex((i, [resource, abundance]) => ({
      resource: Product.getType(parseInt(resource)).name,
      abundance,
      fill: chartColors[i % chartColors.length],
    }))
  )

  return (
    <ChartContainer config={{}} className='flex h-full w-full max-w-[50rem]'>
      <PieChart margin={{ left: 64, right: 64, top: 16, bottom: 16 }}>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name) =>
                `${name}: ${((value as number) * 100).toFixed(1)}%`
              }
            />
          }
        />
        <Pie
          data={chartData}
          animationDuration={300}
          nameKey='resource'
          dataKey='abundance'
          label={({ payload, ...props }) => (
            <text {...props}>{payload.resource}</text>
          )}
        />
      </PieChart>
    </ChartContainer>
  )
}
