'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { A, D, F, O, pipe } from '@mobily/ts-belt'
import { Time } from '@influenceth/sdk'
import { format } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { chartColors } from '@/lib/colors'

export type DistanceChartData = {
  asteroidDistances: Record<number, number>
  time: number
}

export type DistancesChartProps = {
  asteroidNames: Map<number, string>
  distances: DistanceChartData[]
}

export const DistancesChart = ({
  distances,
  asteroidNames,
}: DistancesChartProps) => {
  const asteroidIds = [...asteroidNames.keys()]
  const maxDistance =
    pipe(
      distances,
      A.map((d) => D.values(d.asteroidDistances)),
      A.flat,
      A.sortBy(F.identity),
      A.last,
      O.map(Math.ceil)
    ) ?? 0

  return (
    <ChartContainer config={{}} className='h-full max-h-[40rem] w-full'>
      <LineChart data={distances}>
        <XAxis
          dataKey='time'
          orientation='top'
          xAxisId={0}
          tickFormatter={(value) => Math.round(value).toLocaleString()}
        />
        <XAxis
          xAxisId={1}
          dataKey='time'
          orientation='bottom'
          tickFormatter={(value) => {
            const time = Time.fromGameClockADays(value as number)
            return format(time.toDate(), 'LLL dd')
          }}
        />
        <YAxis
          tickFormatter={(value) => `${value} AU`}
          ticks={A.range(1, maxDistance)}
          domain={[0, maxDistance]}
        />
        <CartesianGrid vertical={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const aDays = payload[0]?.payload?.time as number
                const time = Time.fromGameClockADays(aDays).toDate()
                return (
                  <div className='font-bold'>
                    {format(time, 'PP')} -{' '}
                    {Math.round(aDays).toLocaleString() + ' Days'}
                  </div>
                )
              }}
              formatter={(value, name, item) => (
                <div className='flex items-center gap-x-2'>
                  <div
                    style={{ background: item.stroke }}
                    className='h-2 w-2 rounded-full'
                  />
                  {asteroidNames.get(
                    parseInt(name?.toString()?.split('.')?.[1] ?? '0')
                  )}
                  : {(value as number).toFixed(3)} AU
                </div>
              )}
            />
          }
        />
        {asteroidIds.map((asteroidId, index) => (
          <Line
            key={asteroidId}
            dataKey={`asteroidDistances.${asteroidId}`}
            dot={false}
            strokeWidth={2}
            stroke={chartColors[index % chartColors.length]}
            animationDuration={300}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
