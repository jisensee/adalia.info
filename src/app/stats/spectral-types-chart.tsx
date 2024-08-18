'use client'

import { AsteroidSpectralType } from '@prisma/client'
import { Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { rarityColors } from '@/lib/colors'

export type SpectralTypesChartProps = {
  data: { spectralType: AsteroidSpectralType; count: number }[]
}
export const SpectralTypesChart = ({ data }: SpectralTypesChartProps) => {
  const colors = Object.values(rarityColors)
  const chartData = data.map((d, i) => ({
    ...d,
    fill: colors[i % colors.length],
  }))
  return (
    <div className='rounded-md border border-primary px-4 py-2'>
      <h2>Spectral Types</h2>
      <ChartContainer config={{}} className='min-h-96 w-full'>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={chartData}
            nameKey='spectralType'
            dataKey='count'
            label={({ payload, ...props }) => (
              <text {...props}>{payload.spectralType}</text>
            )}
          />
        </PieChart>
      </ChartContainer>
    </div>
  )
}
