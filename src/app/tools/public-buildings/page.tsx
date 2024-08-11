import { Entity } from '@influenceth/sdk'
import { getEntityName } from 'influence-typed-sdk/api'
import { getPublicBuildings } from './api'
import { PublicBuildingFilters } from './filters'
import { publicBuildingsParamsCache } from './params'
import { PublicBuildingsTable } from './table'
import { influenceApi } from '@/lib/influence-api/api'

export default async function PublicBuildingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { buildingType, asteroidId, habitatLotIndex } =
    publicBuildingsParamsCache.parse(searchParams)

  const [buildings, asteroid] =
    buildingType && asteroidId
      ? await Promise.all([
          getPublicBuildings(buildingType, asteroidId, habitatLotIndex),
          influenceApi.entity({
            id: asteroidId,
            label: Entity.IDS.ASTEROID,
          }),
        ])
      : []

  return (
    <div className='space-y-3 p-3'>
      <h1>Public Buildings</h1>
      <PublicBuildingFilters />
      {buildings && asteroid ? (
        <PublicBuildingsTable
          buildings={buildings.buildings}
          asteroidName={getEntityName(asteroid)}
        />
      ) : (
        <p>
          Enter a building type and asteroid ID to find all public buildings of
          that type for an asteroid.
        </p>
      )}
    </div>
  )
}
