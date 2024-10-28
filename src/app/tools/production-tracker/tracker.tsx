'use client'

import { Product } from '@influenceth/sdk'

import { A, D, F, pipe } from '@mobily/ts-belt'
import { useQuery } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { ProductAmount } from '../trader-dashboard/product-amount'
import { AsteroidOverview } from './asteroid-overview'
import { fetchProductionTrackerData } from './api'
import { productionTrackerParams } from './params'
import { ProductionTrackerForm } from './form'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SwayAmount } from '@/components/sway-amount'
import { ProductIcon } from '@/components/influence-asset-icons'
import { useRefreshTimer } from '@/hooks/timers'
import { Progress } from '@/components/ui/progress'

const UPDATE_INTERVAL = 60

export const ProductionTracker = () => {
  const [{ walletAddress }] = useQueryStates(productionTrackerParams)

  const { data, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ['production-tracker', walletAddress],
    queryFn: () => fetchProductionTrackerData(walletAddress ?? ''),
    placeholderData: F.identity,
    enabled: !!walletAddress,
  })

  const secondsUntilUpdate = useRefreshTimer(UPDATE_INTERVAL, refetch)

  const incomingProducts = data && (
    <div className='flex flex-col gap-2 sm:flex-row md:flex-wrap'>
      {data.incomingProductsWithPrices.map(
        ({ product, amount, marketValue }) => (
          <div
            key={product}
            className='flex items-center gap-x-2 rounded border border-primary px-2 py-1'
          >
            <ProductIcon product={product} size={40} />
            <div className='flex w-full flex-row items-center justify-between sm:flex-col'>
              <ProductAmount
                product={Product.getType(product)}
                amount={amount}
                hideBadges
                hideIcon
              />
              <SwayAmount sway={marketValue} />
            </div>
          </div>
        )
      )}
    </div>
  )

  const updateTimer = data && (
    <div className='fixed right-4 top-20 z-50 float-right w-48'>
      <Progress
        className='h-5'
        value={((UPDATE_INTERVAL - secondsUntilUpdate) / UPDATE_INTERVAL) * 100}
        loading={isRefetching}
      >
        {isRefetching ? (
          <span>Updating...</span>
        ) : (
          <span>
            Next update in{' '}
            <span className='font-mono'>{secondsUntilUpdate}</span>s
          </span>
        )}
      </Progress>
    </div>
  )

  return (
    <div className='space-y-3'>
      {updateTimer}
      <h1>Production Tracker</h1>
      <ProductionTrackerForm
        loading={isRefetching || isLoading}
        refresh={refetch}
      />
      {data && (
        <Accordion
          type='multiple'
          defaultValue={data.groupedData.map(D.prop('asteroidName'))}
        >
          <AccordionItem value='incoming-products'>
            <div className='flex items-center gap-x-5'>
              <AccordionTrigger>Incoming Products</AccordionTrigger>
              <SwayAmount sway={data.incomingValue} large colored />
            </div>
            <AccordionContent>{incomingProducts}</AccordionContent>
          </AccordionItem>
          {pipe(
            data.groupedData,
            A.sortBy(
              (d) =>
                -(d.asteroidActivities.length + d.asteroidIdleBuildings.length)
            ),
            A.map((entry) => (
              <AsteroidOverview
                key={entry.asteroidName}
                data={entry}
                entityMap={data.entityMap}
                floorPrices={data.floorPrices}
              />
            ))
          )}
        </Accordion>
      )}
    </div>
  )
}
