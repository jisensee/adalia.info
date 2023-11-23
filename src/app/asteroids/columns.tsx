'use client'

import {
  Asteroid,
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Format } from '@/lib/format'
import { radiusToSurfaceArea } from '@/lib/utils'

const colHelper = createColumnHelper<AsteroidRow>()

export type AsteroidRow = {
  id: number
  name?: string | null
  owner?: string | null
  scanStatus: AsteroidScanStatus
  size: AsteroidSize
  radius: number
  surfaceArea: number
  spectralType: AsteroidSpectralType
  rarity?: AsteroidRarity | null
  orbitalPeriod: number
  inclination: number
  eccentricity: number
  semiMajorAxis: number
  scanBonus?: number
}

const getScanBonus = (purchaseOrder: number | null) => {
  if (!purchaseOrder) {
    return 1
  }

  if (purchaseOrder < 100) {
    return 4
  } else if (purchaseOrder < 1000) {
    return 3
  } else if (purchaseOrder < 10000) {
    return 2
  } else {
    return 1
  }
}

export const toAsteroidRow = (asteroid: Asteroid): AsteroidRow => ({
  id: asteroid.id,
  name: asteroid.name,
  owner: asteroid.ownerAddress,
  size: asteroid.size,
  radius: asteroid.radius,
  surfaceArea: radiusToSurfaceArea(asteroid.radius),
  spectralType: asteroid.spectralType,
  rarity: asteroid.rarity,
  scanStatus: asteroid.scanStatus,
  orbitalPeriod: asteroid.orbitalPeriod,
  inclination: asteroid.inclination,
  eccentricity: asteroid.eccentricity,
  semiMajorAxis: asteroid.semiMajorAxis,
  scanBonus: getScanBonus(asteroid.purchaseOrder),
})

export type AsteroidColumn = keyof AsteroidRow

export const allAsteroidColumns: AsteroidColumn[] = [
  'id',
  'name',
  'owner',
  'scanStatus',
  'size',
  'radius',
  'spectralType',
  'rarity',
  'surfaceArea',
  'orbitalPeriod',
  'inclination',
  'eccentricity',
  'semiMajorAxis',
]

const columnNames: Record<AsteroidColumn, string> = {
  id: 'ID',
  name: 'Name',
  owner: 'Owner',
  scanStatus: 'Scan status',
  size: 'Size',
  radius: 'Radius',
  spectralType: 'Type',
  rarity: 'Rarity',
  surfaceArea: 'Surface area',
  orbitalPeriod: 'Orbital period',
  inclination: 'Inclination',
  eccentricity: 'Eccentricity',
  semiMajorAxis: 'Semi major axis',
  scanBonus: 'Scan bonus',
}

export const getAsteroidColumnName = (col: AsteroidColumn): string =>
  columnNames[col]

export const nonSortableColumns: AsteroidColumn[] = [
  'owner',
  'scanStatus',
  'spectralType',
  'rarity',
]

const col = (
  id: AsteroidColumn,
  render: (asteroid: AsteroidRow) => ReactNode
): ColumnDef<AsteroidRow> =>
  colHelper.display({
    id,
    header: getAsteroidColumnName(id),
    cell: (props) => render(props.row.original),
  })

export const columnDef: ColumnDef<AsteroidRow>[] = [
  col('id', (asteroid) => (
    <Link
      className='text-primary hover:underline'
      href={`/asteroids/${asteroid.id}`}
    >
      {asteroid.id}
    </Link>
  )),
  col('name', (asteroid) => asteroid.name),
  col('owner', (asteroid) =>
    asteroid.owner ? Format.ethAddress(asteroid.owner, 4) : ''
  ),
  col('scanStatus', (asteroid) =>
    Format.asteroidScanStatus(asteroid.scanStatus)
  ),
  col('scanBonus', (asteroid) =>
    asteroid.scanBonus ? asteroid.scanBonus + 'x' : ''
  ),
  col('size', (asteroid) => Format.asteroidSize(asteroid.size)),
  col('radius', (asteroid) => Format.radius(asteroid.radius)),
  col('spectralType', (asteroid) => (
    <span className='text-primary'>{asteroid.spectralType}</span>
  )),
  col(
    'rarity',
    (asteroid) =>
      asteroid.rarity && (
        <span className={Format.asteroidRarityClassName(asteroid.rarity)}>
          {Format.asteroidRarity(asteroid.rarity)}
        </span>
      )
  ),
  col('surfaceArea', (asteroid) =>
    Format.surfaceArea(radiusToSurfaceArea(asteroid.radius))
  ),
  col('orbitalPeriod', (asteroid) =>
    Format.orbitalPeriod(asteroid.orbitalPeriod)
  ),
  col('inclination', (asteroid) => Format.inclination(asteroid.inclination)),
  col('eccentricity', (asteroid) => Format.eccentricity(asteroid.eccentricity)),
  col('semiMajorAxis', (asteroid) =>
    Format.semiMajorAxis(asteroid.semiMajorAxis)
  ),
]
