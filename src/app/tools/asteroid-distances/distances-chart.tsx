import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { A, D, F, O, pipe, S } from '@mobily/ts-belt'
import { Time } from '@influenceth/sdk'
import { format } from 'date-fns'
import { getEntityName } from 'influence-typed-sdk/api'
import { MoveHorizontal } from 'lucide-react'
import { calculateDistances } from './distances'
import { ResolvedTrip } from './actions'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { chartColors } from '@/lib/colors'
import { Format } from '@/lib/format'

export type DistancesChartProps = {
  trips: ResolvedTrip[]
  distances: ReturnType<typeof calculateDistances>
}

export const DistancesChart = ({ trips, distances }: DistancesChartProps) => {
  const maxDistance =
    pipe(
      distances,
      A.map((d) => D.values(d.distances)),
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
                  {pipe(
                    name?.toString(),
                    S.split('.'),
                    A.last,
                    (tripId) => A.find(trips, (trip) => trip.id === tripId),
                    O.map((trip) => (
                      <div key={trip.id} className='flex items-center gap-x-2'>
                        <span className='text-primary'>
                          {getEntityName(trip.origin)}
                        </span>
                        <MoveHorizontal />
                        <span className='text-primary'>
                          {getEntityName(trip.destination)}
                        </span>
                      </div>
                    ))
                  )}
                  <span className='font-bold'>
                    {Format.asteroidDistance(value as number)}
                  </span>
                </div>
              )}
            />
          }
        />
        {trips.map((trip, index) => (
          <Line
            key={trip.id}
            dataKey={`distances.${trip.id}`}
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
