import { Entity, Lot, Product } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { Pie, PieChart } from 'recharts'
import { Fragment, useMemo, useState } from 'react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { chartColors } from '@/lib/colors'
import { ProductIcon } from '@/components/influence-asset-icons'
import { Format } from '@/lib/format'
import { LotLink } from '@/components/lot-link'
import { StandardTooltip } from '@/components/ui/tooltip'
import { useDebouncedState } from '@/hooks/debounce'
import { Slider } from '@/components/ui/slider'
import { LotAbundances } from '@/lib/abundances'
import { Button } from '@/components/ui/button'

export type AbundanceAnalysisProps = {
  abundances: LotAbundances[]
  availableResources: number[]
  asteroidId: number
  showLotTable: () => void
}

export const AbundanceAnalysis = ({
  abundances,
  availableResources,
  asteroidId,
  showLotTable,
}: AbundanceAnalysisProps) => {
  const [abundanceThreshold, setAbundanceThreshold] = useState(50)
  const debouncedAbundanceThreshold = useDebouncedState(abundanceThreshold, 500)

  const resourceLotCounts = useMemo(() => {
    const counts = new Map<number, number>()

    abundances.forEach((la) => {
      D.mapWithKey(la.resources, (resource, abundance) => {
        if (abundance < debouncedAbundanceThreshold / 100) return
        const currentCount = counts.get(resource)
        if (currentCount === undefined) {
          counts.set(resource, 1)
        } else {
          counts.set(resource, currentCount + 1)
        }
      })
    })

    return counts
  }, [debouncedAbundanceThreshold, abundances])

  const lotCountChartData = pipe(
    [...resourceLotCounts.entries()],
    A.mapWithIndex((i, [resource, lotCount]) => ({
      resource: Product.getType(resource).name,
      resourceId: resource,
      lotCount,
      fill: chartColors[i % chartColors.length],
    })),
    A.sortBy(({ lotCount }) => -lotCount)
  )

  const missingResources = (
    <div className='space-y-1'>
      <h2>Missing resources</h2>
      {availableResources
        .filter((resource) =>
          abundances.every((a) => (a.resources[resource] ?? 0) < 0.05)
        )
        .map((resource) => (
          <div key={resource} className='flex items-center gap-x-1'>
            <ProductIcon product={resource} size={32} />
            <p>{Product.getType(resource).name}</p>
          </div>
        ))}
    </div>
  )

  const lotCountList = (
    <div className='grid h-fit w-64 grid-cols-[max-content,1fr] items-center justify-start gap-x-5 gap-y-1'>
      {lotCountChartData.map(({ resourceId, resource, lotCount }) => (
        <Fragment key={resourceId}>
          <div className='flex w-fit items-center gap-1'>
            <ProductIcon product={resourceId} size={24} />
            <span>{resource}</span>
          </div>
          <p>{lotCount.toLocaleString()}</p>
        </Fragment>
      ))}
    </div>
  )

  const bestLots = (
    <div className='flex flex-col gap-y-2'>
      <h2>Best lots</h2>
      {pipe(
        abundances,
        A.sortBy((a) => -a.summedAbundances),
        A.take(5),
        A.map((a) => {
          const goodResources = pipe(
            a.resources,
            D.toPairs,
            A.sortBy(([, abundance]) => -abundance),
            A.take(3)
          )
          return (
            <div
              key={a.lotIndex}
              className='flex items-center gap-x-2 rounded-md border border-primary p-2'
            >
              <LotLink
                uuid={Entity.packEntity({
                  id: Lot.toId(asteroidId, a.lotIndex),
                  label: Entity.IDS.LOT,
                })}
              />
              <div className='flex gap-x-2'>
                {goodResources.map(([resource, abundance]) => (
                  <StandardTooltip
                    key={resource}
                    content={Product.getType(parseInt(resource)).name}
                  >
                    <div key={resource} className='flex items-center'>
                      <ProductIcon product={parseInt(resource)} size={32} />
                      <p className='text-lg'>{Format.abundance(abundance)}</p>
                    </div>
                  </StandardTooltip>
                ))}
              </div>
            </div>
          )
        })
      )}
      <Button variant='outline' onClick={showLotTable}>
        See all
      </Button>
    </div>
  )

  const lotCountChart = (
    <ChartContainer config={{}} className='h-full w-full max-w-[40rem]'>
      <PieChart margin={{ left: 64, right: 64, top: 16, bottom: 16 }}>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={lotCountChartData}
          nameKey='resource'
          dataKey='lotCount'
          animationDuration={300}
          label={({ payload, ...props }) => (
            <text {...props}>{payload.resource}</text>
          )}
        />
      </PieChart>
    </ChartContainer>
  )

  const abundanceThresholdSlider = (
    <div className='w-52'>
      <p>Abundance Threshold: {Math.round(abundanceThreshold)}%</p>
      <Slider
        className='w-full'
        value={[abundanceThreshold]}
        onValueChange={([v]) => v !== undefined && setAbundanceThreshold(v)}
        min={1}
        max={100}
        step={1}
      />
    </div>
  )

  return (
    <div className='flex flex-wrap gap-x-10 gap-y-5'>
      <div className='space-y-1 rounded-md border border-primary p-5'>
        <div className='flex items-center gap-x-10'>
          <h2>Lot counts by resource</h2>
          {abundanceThresholdSlider}
        </div>
        <div className='flex flex-wrap gap-5'>
          {lotCountList}
          {lotCountChart}
        </div>
      </div>
      {bestLots}
      {missingResources}
    </div>
  )
}
