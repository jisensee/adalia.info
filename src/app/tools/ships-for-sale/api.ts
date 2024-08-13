import { A, D } from '@mobily/ts-belt'
import esb from 'elastic-builder'
import {
  InfluenceEntity,
  entitySchema,
  getEntityName,
  searchResponseSchema,
} from 'influence-typed-sdk/api'
import { Entity, Inventory, Product, Ship } from '@influenceth/sdk'
import { Filters } from './params'
import { influenceApi } from '@/lib/influence-api/api'

export type ShipForSale = Awaited<ReturnType<typeof shipsForSale>>[number]

export const shipsForSale = async (filters: Filters) => {
  const ships = await influenceApi
    .search({
      index: 'ship',
      request: esb
        .requestBodySearch()
        .query(
          esb
            .boolQuery()
            .must([
              esb.existsQuery('Nft.price'),
              ...(filters.seller
                ? [esb.termQuery('Nft.owner', filters.seller)]
                : []),
              ...(filters.shipType
                ? [esb.termQuery('Ship.shipType', filters.shipType)]
                : []),
              ...(filters.shipVariant
                ? [esb.termQuery('Ship.variant', filters.shipVariant)]
                : []),
              ...(filters.asteroidId
                ? [
                    esb.nestedQuery(
                      esb
                        .boolQuery()
                        .must([
                          esb.termQuery(
                            'Location.locations.label',
                            Entity.IDS.ASTEROID
                          ),
                          esb.termQuery(
                            'Location.locations.id',
                            filters.asteroidId
                          ),
                        ]),
                      'Location.locations'
                    ),
                  ]
                : []),
            ])
        )
        .size(999),
      options: {
        responseSchema: searchResponseSchema(entitySchema),
      },
    })
    .then((r) => r.hits.hits.map(D.prop('_source')))

  const [spaceportNames, asteroidNames] = await Promise.all([
    influenceApi.util.buildingNames(
      A.filterMap(
        ships,
        (ship) => ship.Location?.resolvedLocations.building?.id
      )
    ),
    influenceApi.util.asteroidNames(
      A.filterMap(
        ships,
        (ship) => ship.Location?.resolvedLocations.asteroid?.id
      )
    ),
  ])

  return A.filterMap(ships, (ship) => {
    const price = ship.Nft?.price
    const seller = ship.Nft?.owner
    const asteroidId = ship.Location?.resolvedLocations?.asteroid?.id
    const spaceportId = ship.Location?.resolvedLocations?.building?.id
    if (!price || !seller || !ship.Ship) return undefined

    return {
      name: getEntityName(ship),
      price,
      type: ship.Ship.shipType,
      variant: ship.Ship.variant,
      lotUuid: ship.Location?.resolvedLocation?.lot?.uuid,
      propellantPercentage: getPropellantPercentage(ship, ship.Ship.shipType),
      cargo: getCargo(ship, ship.Ship.shipType),
      seller,
      asteroid: asteroidId
        ? { id: asteroidId, name: asteroidNames.get(asteroidId) ?? '' }
        : undefined,
      spaceport: spaceportId
        ? { id: spaceportId, name: spaceportNames.get(spaceportId) ?? '' }
        : undefined,
    }
  })
}

const getCargo = (ship: InfluenceEntity, shipType: number) => {
  const invType = Ship.getType(shipType).cargoInventoryType
  if (!invType) return []

  return (
    ship.Inventories.find((i) => i.inventoryType === invType)?.contents ?? []
  )
}

const getPropellantPercentage = (ship: InfluenceEntity, shipType: number) => {
  const propInventory = Ship.getType(shipType).propellantInventoryType
  const propAmount = ship.Inventories.find(
    (i) => i.inventoryType === propInventory
  )?.contents?.find(
    (c) => c.product === Product.IDS.HYDROGEN_PROPELLANT
  )?.amount
  const propCapacity = Inventory.getType(propInventory).massConstraint / 1_000
  return propAmount ? (propAmount / propCapacity) * 100 : 0
}
