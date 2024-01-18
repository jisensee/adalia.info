'use client'

import { AsteroidSpectralType } from '@prisma/client'
import { VictoryPie } from 'victory'
import { ChartContainer } from './chart-container'
import { rarityColors } from '@/lib/colors'

export type SpectralTypesChartProps = {
  data: { spectralType: AsteroidSpectralType; count: number }[]
}
export const SpectralTypesChart = ({ data }: SpectralTypesChartProps) => {
  return (
    <ChartContainer title='Spectral Types'>
      <VictoryPie
        padding={{
          bottom: 70,
          top: 70,
        }}
        data={data}
        colorScale={Object.values(rarityColors)}
        x='spectralType'
        y='count'
        style={{
          labels: {
            fill: '#e2e2e5',
            fontSize: 16,
          },
        }}
        animate={{
          duration: 500,
          onLoad: { duration: 500 },
        }}
      />
    </ChartContainer>
  )
}
