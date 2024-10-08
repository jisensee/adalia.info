import { FC } from 'react'
import { Building, Product } from '@influenceth/sdk'

import {
  getEntityName,
  getOutputAmounts,
  reduceProductAmounts,
} from 'influence-typed-sdk/api'
import { ProductAmount } from '../trader-dashboard/product-amount'
import { AsteroidOverview } from './asteroid-overview'
import { EntityStatus } from './entity-status'
import { Refresh } from './refresh'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SwayAmount } from '@/components/sway-amount'
import { ProductIcon } from '@/components/influence-asset-icons'
import { influenceApi } from '@/lib/influence-api/api'

export type ProductionTrackerProps = {
  walletAddress: string
}

const isProductionBuilding = (buildingId?: number) => {
  if (!buildingId) return false

  return (
    [
      Building.IDS.REFINERY,
      Building.IDS.BIOREACTOR,
      Building.IDS.FACTORY,
      Building.IDS.SHIPYARD,
    ] as number[]
  ).includes(buildingId)
}

export const ProductionTracker: FC<ProductionTrackerProps> = async ({
  walletAddress,
}) => {
  const buildings = await influenceApi.util.buildings(walletAddress)

  const entities = buildings.flatMap((entity): EntityStatus[] => {
    const asteroidId = entity.Location?.resolvedLocations?.asteroid?.id ?? 1
    const lotUuid = entity.Location?.resolvedLocations?.lot?.uuid ?? ''
    const name = entity ? getEntityName(entity) : ''

    const base = {
      asteroidId,
      lotUuid,
      name,
    }

    if (entity.Extractors.some((e) => e.yield > 0)) {
      return entity.Extractors.filter((e) => e.yield > 0).map((extractor) => ({
        type: 'extractor',
        outputProduct: extractor.outputProduct,
        yield: extractor.yield,
        finishTime: extractor.finishTimestamp,
        ...base,
      }))
    }
    if (entity.Processors.some((p) => p.recipes > 0)) {
      return entity.Processors.filter((p) => p.recipes > 0).map(
        (processor) => ({
          type: 'process',
          finishTime: processor.finishTimestamp,
          runningProcess: processor.runningProcess,
          outputProduct: processor.outputProduct,
          processorType: processor.processorType,
          recipes: processor.recipes,
          secondaryEff: processor.secondaryEff,
          ...base,
        })
      )
    }
    if (
      entity.Building?.status ===
      Building.CONSTRUCTION_STATUSES.UNDER_CONSTRUCTION
    ) {
      return [
        {
          type: 'building',
          buildingType: entity.Building.buildingType,
          finishTime: entity.Building.finishTimestamp,
          ...base,
        },
      ]
    }

    const isIdleExtractor =
      entity.Building?.buildingType === Building.IDS.EXTRACTOR &&
      !entity.Extractors.some((e) => e.yield > 0)
    const isIdleProduction =
      isProductionBuilding(entity?.Building?.buildingType) &&
      !entity.Processors.some((p) => p.recipes > 0)

    if (
      entity.Building &&
      entity.Building.status === Building.CONSTRUCTION_STATUSES.OPERATIONAL &&
      (isIdleExtractor || isIdleProduction)
    ) {
      return [
        {
          type: 'idleBuilding',
          buildingType: entity.Building.buildingType,
          finishTime: new Date(),
          ...base,
        },
      ]
    }
    return []
  })

  const asteroidIds = [...new Set(entities.map(({ asteroidId }) => asteroidId))]
  const asteroidIdToName = await influenceApi.util.asteroidNames(asteroidIds)

  const asteroidToEntities = new Map<string, EntityStatus[]>()

  const incomingProducts = reduceProductAmounts(
    entities.flatMap((entity) => {
      if (entity.type === 'extractor') {
        return [
          {
            product: entity.outputProduct,
            amount: entity.yield,
          },
        ]
      }
      if (entity.type === 'process') {
        return getOutputAmounts(
          entity.runningProcess,
          entity.outputProduct,
          entity.recipes,
          entity.secondaryEff
        )
      }
      return []
    })
  )

  entities.forEach((entity) => {
    const asteroidName =
      asteroidIdToName.get(entity.asteroidId) ?? entity.asteroidId.toString()
    const processors = asteroidToEntities.get(asteroidName) ?? []
    processors.push(entity)
    asteroidToEntities.set(asteroidName, processors)
  })
  const entries = [...asteroidToEntities.entries()].sort(
    (a, b) => b[1].length - a[1].length
  )

  const floorPrices = await influenceApi.util.floorPrices(
    incomingProducts.map(({ product }) => product)
  )

  const incomingProductsWithPrices = incomingProducts
    .map(({ product, amount }) => ({
      product,
      amount,
      marketValue: amount * (floorPrices.get(product) ?? 0),
    }))
    .sort((a, b) => b.marketValue - a.marketValue)

  const incomingValue = incomingProductsWithPrices.reduce(
    (acc, { marketValue }) => acc + marketValue,
    0
  )

  return (
    <>
      <Accordion
        type='multiple'
        defaultValue={entries.map(([asteroid]) => asteroid)}
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
        {entries.map(([asteroid, entities]) => (
          <AsteroidOverview
            key={asteroid}
            asteroid={asteroid}
            entities={entities}
          />
        ))}
      </Accordion>
      <Refresh />
    </>
  )
}
