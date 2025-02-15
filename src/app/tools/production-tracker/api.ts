'use server'

import { Building, Entity } from '@influenceth/sdk'

import {
  entitySchema,
  reduceProductAmounts,
  searchResponseSchema,
} from 'influence-typed-sdk/api'

import esb from 'elastic-builder'
import { A, D, pipe } from '@mobily/ts-belt'
import { influenceApi } from '@/lib/influence-api/api'

export type TrackerAsteroidData = Awaited<
  ReturnType<typeof fetchProductionTrackerData>
>['groupedData'][number]

export const fetchProductionTrackerData = async (walletAddress: string) => {
  const crews = await influenceApi.util.crews(walletAddress)
  const activities = await Promise.all(
    crews.map((crew) =>
      influenceApi.activities({
        uuid: Entity.packEntity({ id: crew.id, label: Entity.IDS.CREW }),
        types: [
          'MaterialProcessingStarted',
          'ResourceExtractionStarted',
          'ShipAssemblyStarted',
          'ConstructionStarted',
        ],
        unresolved: true,
      })
    )
  ).then((a) => a.flat())

  const activityEntities = activities.flatMap(({ event }) => {
    switch (event.name) {
      case 'ConstructionStarted':
        return [event.returnValues.building]
      case 'ResourceExtractionStarted':
        return [event.returnValues.extractor, event.returnValues.destination]
      case 'MaterialProcessingStarted':
        return [
          event.returnValues.processor,
          event.returnValues.origin,
          event.returnValues.destination,
        ]
      case 'ShipAssemblyStarted':
        return [event.returnValues.dryDock]
      default:
        return []
    }
  })
  const activityBuildingIds = activityEntities
    .filter((e) => e.label === Entity.IDS.BUILDING)
    .map(D.prop('id'))
  const activityShipIds = activityEntities
    .filter((e) => e.label === Entity.IDS.SHIP)
    .map(D.prop('id'))
  const crewUuids = crews.map((c) =>
    Entity.packEntity({ id: c.id, label: Entity.IDS.CREW })
  )
  const asteroidIds = pipe(
    crews,
    A.filterMap((b) => b.Location?.resolvedLocations?.asteroid?.id),
    A.uniq
  )
  const incomingProducts = reduceProductAmounts(
    activities.flatMap(({ event }) => {
      switch (event.name) {
        case 'ResourceExtractionStarted':
          return [
            {
              product: event.returnValues.resource,
              amount: event.returnValues.yield,
            },
          ]
        case 'MaterialProcessingStarted':
          return event.returnValues.outputs
        default:
          return []
      }
    })
  )
  const [buildings, ships, asteroidIdToName, floorPrices] = await Promise.all([
    getBuildings(crewUuids, activityBuildingIds),
    getShips(activityShipIds),
    influenceApi.util.asteroidNames(asteroidIds),
    influenceApi.util.floorPrices(
      incomingProducts.map(({ product }) => product)
    ),
  ])

  const idleBuildings = pipe(
    buildings,
    A.reject((b) =>
      [Building.IDS.WAREHOUSE, Building.IDS.TANK_FARM as number].includes(
        b.Building?.buildingType ?? 0
      )
    ),
    A.reject(({ id }) => activityBuildingIds.includes(id))
  )

  const entityMap = pipe(
    [...buildings, ...ships, ...crews],
    A.map((e) => [Entity.packEntity({ id: e.id, label: e.label }), e] as const),
    (a) => new Map(a)
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

  const groupedData = pipe(
    asteroidIds,
    A.filterMap((asteroidId) => {
      const asteroidName = asteroidIdToName.get(asteroidId)
      if (!asteroidName) return

      const asteroidActivities = activities.filter(
        (a) =>
          a.data?.crew.Location?.resolvedLocations?.asteroid?.id === asteroidId
      )
      const asteroidIdleBuildings = idleBuildings.filter(
        (b) => b.Location?.resolvedLocations?.asteroid?.id === asteroidId
      )
      return {
        asteroidActivities,
        asteroidIdleBuildings,
        asteroidName,
      }
    }),
    A.keep(
      (data) =>
        A.isNotEmpty(data.asteroidActivities) ||
        A.isNotEmpty(data.asteroidIdleBuildings)
    )
  )

  return {
    groupedData,
    incomingProductsWithPrices,
    incomingValue,
    entityMap,
    floorPrices,
  }
}

const getBuildings = async (crewUuids: string[], buildingIds: number[]) =>
  influenceApi
    .search({
      index: 'building',
      request: esb
        .requestBodySearch()
        .size(999)
        .query(
          esb
            .boolQuery()
            .must([
              esb
                .boolQuery()
                .should([
                  esb.termsQuery('id', buildingIds),
                  esb
                    .boolQuery()
                    .must([
                      esb.termsQuery('Control.controller.uuid', crewUuids),
                      esb.termsQuery('Building.buildingType', [
                        Building.IDS.WAREHOUSE,
                        Building.IDS.TANK_FARM,
                        Building.IDS.EXTRACTOR,
                        Building.IDS.REFINERY,
                        Building.IDS.BIOREACTOR,
                        Building.IDS.FACTORY,
                        Building.IDS.SHIPYARD,
                      ]),
                    ]),
                ]),
              esb.termsQuery('Building.status', [
                Building.CONSTRUCTION_STATUSES.OPERATIONAL,
                Building.CONSTRUCTION_STATUSES.UNDER_CONSTRUCTION,
              ]),
            ])
        ),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((result) => result.hits.hits.map((b) => b._source))

const getShips = (shipIds: number[]) =>
  shipIds.length > 0
    ? influenceApi.entities({
        id: shipIds,
        label: Entity.IDS.SHIP,
      })
    : Promise.resolve([])
