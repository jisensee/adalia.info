import { FC } from 'react'
import { Building } from '@influenceth/sdk'

import { ProductAmount } from '../trader-dashboard/product-amount'
import { getProcesses } from './api'
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
import { preReleaseInfluenceApi } from '@/lib/influence-api/api'
import {
  getOutputAmounts,
  reduceProductAmounts,
} from '@/lib/influence-api/helpers'

export type ProductionTrackerProps = {
  walletAddress: string
}

const isProductionBuilding = (buildingId?: number) => {
  if (!buildingId) return false

  return [
    Building.IDS.REFINERY,
    Building.IDS.BIOREACTOR,
    Building.IDS.FACTORY,
    Building.IDS.SHIPYARD,
  ].includes(buildingId)
}

export const ProductionTracker: FC<ProductionTrackerProps> = async ({
  walletAddress,
}) => {
  const r = await getProcesses(walletAddress)

  const entities = r.flatMap((entity): EntityStatus[] => {
    const asteroidId = entity.Location?.locations?.asteroid?.id ?? 1
    const lotUuid = entity.Location?.location?.lot?.uuid ?? ''
    const name = entity.Name

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
        finishTime: extractor.finishTime,
        ...base,
      }))
    }
    if (entity.Processors.some((p) => p.recipes > 0)) {
      return entity.Processors.filter((p) => p.recipes > 0).map(
        (processor) => ({
          type: 'process',
          finishTime: processor.finishTime,
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
          finishTime: entity.Building.finishTime,
          ...base,
        },
      ]
    }

    const isIdleExtractor =
      entity.Building?.buildingType.i === Building.IDS.EXTRACTOR &&
      !entity.Extractors.some((e) => e.yield > 0)
    const isIdleProduction =
      isProductionBuilding(entity?.Building?.buildingType.i) &&
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
  const asteroidIdToName =
    await preReleaseInfluenceApi.util.asteroidNames(asteroidIds)

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
          entity.runningProcess.i,
          entity.outputProduct.i,
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
  const entries = [...asteroidToEntities.entries()]

  const floorPrices = await preReleaseInfluenceApi.util.floorPrices(
    incomingProducts.map(({ product }) => product.i)
  )

  const incomingProductsWithPrices = incomingProducts
    .map(({ product, amount }) => ({
      product,
      amount,
      marketValue: amount * (floorPrices.get(product.i) ?? 0),
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
                    key={product.i}
                    className='flex items-center gap-x-2 rounded border border-primary px-2 py-1'
                  >
                    <ProductIcon product={product} size={40} />
                    <div className='flex w-full flex-row items-center justify-between sm:flex-col'>
                      <ProductAmount
                        product={product}
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
