'use client'

import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel } from 'victory'
import { AsteroidRarity } from '@prisma/client'
import { ChartContainer } from './chart-container'
import { rarityColors } from '@/lib/colors'

export type RarityChartProps = {
  data: { rarity: AsteroidRarity; count: number }[]
}

export const RarityChart = ({ data }: RarityChartProps) => {
  const allRarities = Object.values(AsteroidRarity)
  const missingRarities = allRarities.filter(
    (r) => !data.find((d) => d.rarity === r)
  )
  const chartData = [
    ...data,
    ...missingRarities.map((r) => ({ rarity: r, count: 0 })),
  ].sort(
    (a, b) => allRarities.indexOf(a.rarity) - allRarities.indexOf(b.rarity)
  )

  return (
    <ChartContainer title='Rarities'>
      <VictoryChart
        padding={{
          top: 30,
          bottom: 50,
          left: 130,
          right: 60,
        }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={() => ''}
          style={{
            axis: { stroke: 'none' },
            ticks: { stroke: 'none' },
          }}
        />
        <VictoryAxis
          tickFormat={(t: string) =>
            t[0]?.toUpperCase() + t.slice(1).toLowerCase()
          }
          style={{
            axis: { stroke: 'none' },
            ticks: { stroke: 'none' },
            tickLabels: {
              fill: '#e2e2e5',
            },
          }}
        />
        <VictoryBar
          data={chartData}
          x='rarity'
          y='count'
          animate={{
            duration: 500,
            onLoad: { duration: 500 },
          }}
          labels={({ datum }) => Math.round(datum.count).toLocaleString()}
          style={{
            data: {
              fill: ({ datum }) => rarityColors[datum.rarity as AsteroidRarity],
            },
          }}
          labelComponent={
            <VictoryLabel
              dx={10}
              style={{
                fontSize: 16,
                fill: '#e2e2e5',
              }}
            />
          }
          horizontal
          barRatio={1.3}
        />
      </VictoryChart>
    </ChartContainer>
  )
}
