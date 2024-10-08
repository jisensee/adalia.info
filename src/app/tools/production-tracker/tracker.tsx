'use client'

import { FC, useEffect } from 'react'
import { Product } from '@influenceth/sdk'

import { A, D, pipe } from '@mobily/ts-belt'
import { useQuery } from '@tanstack/react-query'
import { ProductAmount } from '../trader-dashboard/product-amount'
import { AsteroidOverview } from './asteroid-overview'
import { fetchProductionTrackerData } from './api'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SwayAmount } from '@/components/sway-amount'
import { ProductIcon } from '@/components/influence-asset-icons'

export type ProductionTrackerProps = {
  walletAddress: string
}

export const ProductionTracker: FC<ProductionTrackerProps> = async ({
  walletAddress,
}) => {
  const { data, refetch } = useQuery({
    queryKey: ['production-tracker', walletAddress],
    queryFn: () => fetchProductionTrackerData(walletAddress),
    enabled: !!walletAddress,
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (walletAddress) {
        refetch()
      }
    }, 60_000)
    return () => clearInterval(intervalId)
  }, [refetch, walletAddress])

  if (!data) return null

  const {
    groupedData,
    incomingProductsWithPrices,
    incomingValue,
    entityMap,
    floorPrices,
  } = data

  console.log('data', data)

  return (
    <>
      <Accordion
        type='multiple'
        defaultValue={groupedData.map(D.prop('asteroidName'))}
      >
        <AccordionItem value='incoming-products'>
          <div className='flex items-center gap-x-5'>
            <AccordionTrigger>Incoming Products</AccordionTrigger>
            <SwayAmount sway={incomingValue} large colored />
          </div>
          <AccordionContent>
            <div className='flex flex-col gap-2 sm:flex-row md:flex-wrap'>
              {incomingProductsWithPrices.map(
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
          </AccordionContent>
        </AccordionItem>
        {pipe(
          groupedData,
          A.sortBy(
            (d) =>
              -(d.asteroidActivities.length + d.asteroidIdleBuildings.length)
          ),
          A.map((entry) => (
            <AsteroidOverview
              key={entry.asteroidName}
              data={entry}
              entityMap={entityMap}
              floorPrices={floorPrices}
            />
          ))
        )}
      </Accordion>
    </>
  )
}
