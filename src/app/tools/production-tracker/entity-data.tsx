import { match, P } from 'ts-pattern'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { Building, Entity, Process, Product, Ship } from '@influenceth/sdk'
import { differenceInSeconds } from 'date-fns'
import { TrackerAsteroidData } from './api'
import {
  BuildingIcon,
  ProductIcon,
  ShipIcon,
} from '@/components/influence-asset-icons'
import { Format } from '@/lib/format'

export type EntityDataArgs = (
  | {
      activity: TrackerAsteroidData['asteroidActivities'][number]
    }
  | {
      idleBuilding: InfluenceEntity
    }
) & {
  entityMap: Map<string, InfluenceEntity>
  now: Date
}

export type EntityData = NonNullable<ReturnType<typeof getEntityData>>
export const getEntityData = (args: EntityDataArgs) =>
  match(args)
    .with(
      {
        idleBuilding: {
          Building: P.nonNullable,
        },
      },
      ({ idleBuilding }) => {
        const processor = idleBuilding.Processors[0]

        if (processor && processor.runningProcess) {
          const process = Process.getType(processor.runningProcess)
          const amount =
            (process.outputs?.[processor.outputProduct] ?? 0) *
            processor.recipes

          return {
            id: idleBuilding.id.toString(),
            type: 'rented-production' as const,
            name: Process.getType(processor.runningProcess).name,
            subtext: (
              <p>
                Someone rented{' '}
                <span className='font-bold'>{getEntityName(idleBuilding)}</span>{' '}
                from you to produce{' '}
                <span className='font-bold text-primary'>
                  {Format.productAmount(processor.outputProduct, amount)}
                </span>
              </p>
            ),
            building: idleBuilding,
            icon: (size: number) => (
              <ProductIcon product={processor.outputProduct} size={size} />
            ),
            duration: {
              end: processor.finishTimestamp,
              remainingSeconds: differenceInSeconds(
                processor.finishTimestamp,
                args.now
              ),
            },
          }
        } else {
          return {
            id: idleBuilding.id.toString(),
            type: 'idle-building' as const,
            name: getEntityName(idleBuilding),
            building: idleBuilding,
            icon: (size: number) => (
              <BuildingIcon
                building={idleBuilding.Building?.buildingType ?? 1}
                size={size}
              />
            ),
          }
        }
      }
    )
    .with(
      {
        activity: {
          event: { name: 'MaterialProcessingStarted' },
        },
      },
      ({
        activity: {
          id,
          event: { name, returnValues, timestamp },
        },
      }) => {
        const building = args.entityMap.get(
          Entity.packEntity(returnValues.processor)
        )
        const processor = building?.Processors?.find(
          (p) => p.slot === returnValues.processorSlot
        )
        const origin = args.entityMap.get(
          Entity.packEntity(returnValues.origin)
        )
        const destination = args.entityMap.get(
          Entity.packEntity(returnValues.destination)
        )
        const crew = args.entityMap.get(
          Entity.packEntity(returnValues.callerCrew)
        )
        if (!processor || !building?.Building || !crew) {
          return null
        }

        const buildingName = getEntityName(building)
        const remainingSeconds = differenceInSeconds(
          returnValues.finishTimestamp,
          args.now
        )
        return {
          id,
          name: Process.getType(returnValues.process).name,
          type: name,
          building,
          origin,
          destination,
          crew,
          outputs: returnValues.outputs.map((p) => ({
            ...p,
            primary: p.product === processor.outputProduct,
          })),
          subtext: (
            <p>
              <span className='font-bold'>{buildingName}</span>{' '}
              {remainingSeconds < 0 ? 'has produced' : 'is producing'}{' '}
              <span className='font-bold text-primary'>
                {Format.productAmount(
                  processor.outputProduct,
                  returnValues.outputs.find(
                    (p) => p.product === processor.outputProduct
                  )?.amount ?? 0
                )}
              </span>
            </p>
          ),
          duration: {
            start: timestamp,
            end: returnValues.finishTimestamp,
            remainingSeconds,
          },
          icon: (size: number) => (
            <ProductIcon product={processor.outputProduct} size={size} />
          ),
        }
      }
    )
    .with(
      { activity: { event: { name: 'ResourceExtractionStarted' } } },
      ({ activity }) => {
        const building = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.extractor)
        )
        const destination = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.destination)
        )
        const crew = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.callerCrew)
        )
        if (!building?.Building || !destination || !crew) return null

        const remainingSeconds = differenceInSeconds(
          activity.event.returnValues.finishTimestamp,
          args.now
        )

        return {
          id: activity.id,
          name:
            Product.getType(activity.event.returnValues.resource).name +
            ' extraction',
          type: activity.event.name,
          crew,
          destination,
          building,
          outputs: [
            {
              product: activity.event.returnValues.resource,
              amount: activity.event.returnValues.yield,
              primary: true,
            },
          ],
          subtext: (
            <p>
              <span className='font-bold'>{getEntityName(building)}</span>{' '}
              {remainingSeconds < 0 ? 'has extracted' : 'is extracting'}{' '}
              <span className='font-bold text-primary'>
                {Format.productAmount(
                  activity.event.returnValues.resource,
                  activity.event.returnValues.yield
                )}
              </span>
            </p>
          ),
          duration: {
            start: activity.event.timestamp,
            end: activity.event.returnValues.finishTimestamp,
            remainingSeconds,
          },
          icon: (size: number) => (
            <ProductIcon
              product={activity.event.returnValues.resource}
              size={size}
            />
          ),
        }
      }
    )
    .with(
      {
        activity: { event: { name: 'ConstructionStarted' } },
      },
      ({ activity }) => {
        const building = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.building)
        )
        const crew = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.callerCrew)
        )
        const remainingSeconds = differenceInSeconds(
          activity.event.returnValues.finishTimestamp,
          args.now
        )
        if (!building?.Building || !crew) return null
        return {
          id: activity.id,
          type: activity.event.name,
          name:
            Building.getType(building.Building.buildingType).name +
            ' construction',
          building,
          crew,
          duration: {
            start: activity.event.timestamp,
            end: activity.event.returnValues.finishTimestamp,
            remainingSeconds,
          },
          icon: (size: number) => (
            <BuildingIcon
              building={building.Building?.buildingType ?? 1}
              size={size}
              isHologram
            />
          ),
        }
      }
    )
    .with(
      {
        activity: { event: { name: 'ShipAssemblyStarted' } },
      },
      ({ activity }) => {
        const building = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.dryDock)
        )
        const crew = args.entityMap.get(
          Entity.packEntity(activity.event.returnValues.callerCrew)
        )
        if (!building?.Building || !crew) return null

        const remainingSeconds = differenceInSeconds(
          activity.event.returnValues.finishTimestamp,
          args.now
        )

        return {
          id: activity.id,
          type: activity.event.name,
          name:
            Ship.getType(activity.event.returnValues.shipType).name +
            ' assembly',
          building: building,
          crew,
          shipType: activity.event.returnValues.shipType,
          subtext: (
            <p>
              <span className='font-bold'>{getEntityName(building)}</span>{' '}
              {remainingSeconds < 0 ? 'has assembled' : 'is assembling'} a{' '}
              <span className='text-primary'>
                {Ship.getType(activity.event.returnValues.shipType).name}
              </span>
            </p>
          ),
          duration: {
            start: activity.event.timestamp,
            end: activity.event.returnValues.finishTimestamp,
            remainingSeconds,
          },
          icon: (size: number) => (
            <ShipIcon ship={activity.event.returnValues.shipType} size={size} />
          ),
        }
      }
    )
    .otherwise(() => null)
