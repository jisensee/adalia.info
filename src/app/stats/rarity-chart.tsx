'use client'

import { AsteroidRarity } from '@prisma/client'
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts'
import { A, pipe } from '@mobily/ts-belt'
import { ChartContainer } from '@/components/ui/chart'
import { rarityColors } from '@/lib/colors'
import { Format } from '@/lib/format'

export type RarityChartProps = {
  data: { rarity: AsteroidRarity; count: number }[]
}

export const RarityChart = ({ data }: RarityChartProps) => {
  const allRarities = Object.values(AsteroidRarity)
  const missingRarities = allRarities.filter(
    (r) => !data.find((d) => d.rarity === r)
  )
  const chartData = pipe(
    [...data, ...missingRarities.map((r) => ({ rarity: r, count: 0 }))],
    A.sortBy((d) => allRarities.indexOf(d.rarity)),
    A.reverse,
    A.map((d) => ({ ...d, fill: rarityColors[d.rarity] }))
  )

  return (
    <div className='rounded-md border border-primary px-4 py-2'>
      <h2>Rarities</h2>
      <ChartContainer className='min-h-96 w-full' title='Rarities' config={{}}>
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 75 }}
          layout='vertical'
        >
          <YAxis
            dataKey='rarity'
            type='category'
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => Format.asteroidRarity(value)}
          />
          <XAxis dataKey='count' type='number' hide />
          <Bar
            dataKey='count'
            layout='vertical'
            radius={5}
            animationDuration={300}
          >
            <LabelList dataKey='count' position='right' offset={12} />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}
