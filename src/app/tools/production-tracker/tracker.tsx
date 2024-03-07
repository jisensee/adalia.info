import { FC } from 'react'
import { Building, Entity } from '@influenceth/sdk'

import { differenceInSeconds } from 'date-fns'
import { getAsteroidNames, getProcesses } from './api'
import { AsteroidOverview } from './asteroid-overview'
import { EntityStatus } from './entity-status'
import { Accordion } from '@/components/ui/accordion'

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
    const asteroidId =
      entity.Location?.locations?.find((l) => l.label === Entity.IDS.ASTEROID)
        ?.id ?? 1
    const lotUuid = entity.Location?.location?.uuid ?? ''
    const name = entity.Name?.name

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
        remainingSeconds: differenceInSeconds(extractor.finishTime, new Date()),
        ...base,
      }))
    }
    if (entity.Processors.some((p) => p.recipes > 0)) {
      return entity.Processors.filter((p) => p.recipes > 0).map(
        (processor) => ({
          type: 'process',
          remainingSeconds: differenceInSeconds(
            processor.finishTime,
            new Date()
          ),
          runningProcess: processor.runningProcess,
          outputProduct: processor.outputProduct,
          processorType: processor.processorType,
          recipes: processor.recipes,
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
          remainingSeconds: differenceInSeconds(
            entity.Building.finishTime,
            new Date()
          ),
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
          ...base,
        },
      ]
    }
    return []
  })

  const asteroidIds = [...new Set(entities.map(({ asteroidId }) => asteroidId))]
  const asteroidIdToName = await getAsteroidNames(asteroidIds)

  const asteroidToEntities = new Map<string, EntityStatus[]>()

  entities.forEach((entity) => {
    const asteroidName =
      asteroidIdToName.get(entity.asteroidId) ?? entity.asteroidId.toString()
    const processors = asteroidToEntities.get(asteroidName) ?? []
    processors.push(entity)
    asteroidToEntities.set(asteroidName, processors)
  })
  const entries = [...asteroidToEntities.entries()]

  return (
    <Accordion
      type='multiple'
      defaultValue={entries.map(([asteroid]) => asteroid)}
    >
      {entries.map(([asteroid, entities]) => (
        <AsteroidOverview
          key={asteroid}
          asteroid={asteroid}
          entities={entities}
        />
      ))}
    </Accordion>
  )
}
