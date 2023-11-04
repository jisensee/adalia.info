'use client'

import { Asteroid } from '@prisma/client'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Format } from '@/lib/format'

const colHelper = createColumnHelper<Asteroid>()

export type AsteroidColumn =
  | 'id'
  | 'name'
  | 'ownerAddress'
  | 'scanStatus'
  | 'size'
  | 'radius'
  | 'spectralType'
  | 'rarity'
  | 'surfaceArea'
  | 'orbitalPeriod'
  | 'inclination'
  | 'eccentricity'
  | 'semiMajorAxis'

export const allAsteroidColumns: AsteroidColumn[] = [
  'id',
  'name',
  'ownerAddress',
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

export const getAsteroidColumnName = (col: AsteroidColumn): string => {
  switch (col) {
    case 'id':
      return 'ID'
    case 'name':
      return 'Name'
    case 'ownerAddress':
      return 'Owner'
    case 'scanStatus':
      return 'Scan status'
    case 'size':
      return 'Size'
    case 'radius':
      return 'Radius'
    case 'spectralType':
      return 'Type'
    case 'rarity':
      return 'Rarity'
    case 'surfaceArea':
      return 'Surface area'
    case 'orbitalPeriod':
      return 'Orbital period'
    case 'inclination':
      return 'Inclination'
    case 'eccentricity':
      return 'Eccentricity'
    case 'semiMajorAxis':
      return 'Semi major axis'
  }
}

export const nonSortableColumns: AsteroidColumn[] = [
  'ownerAddress',
  'scanStatus',
  'spectralType',
  'rarity',
]

const col = (
  id: AsteroidColumn,
  render: (asteroid: Asteroid) => ReactNode
): ColumnDef<Asteroid> =>
  colHelper.display({
    id,
    header: getAsteroidColumnName(id),
    cell: (props) => render(props.row.original),
  })

export const columnDef: ColumnDef<Asteroid>[] = [
  col('id', (asteroid) => (
    <Link
      className='text-primary hover:underline'
      href={`/asteroids/${asteroid.id}`}
    >
      {asteroid.id}
    </Link>
  )),
  col('name', (asteroid) => asteroid.name),
  col('ownerAddress', (asteroid) =>
    asteroid.ownerAddress ? Format.ethAddress(asteroid.ownerAddress, 4) : ''
  ),
  col('scanStatus', (asteroid) =>
    Format.asteroidScanStatus(asteroid.scanStatus)
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
  col('surfaceArea', (asteroid) => Format.surfaceArea(asteroid.surfaceArea)),
  col('orbitalPeriod', (asteroid) =>
    Format.orbitalPeriod(asteroid.orbitalPeriod)
  ),
  col('inclination', (asteroid) => Format.inclination(asteroid.inclination)),
  col('eccentricity', (asteroid) => Format.eccentricity(asteroid.eccentricity)),
  col('semiMajorAxis', (asteroid) =>
    Format.semiMajorAxis(asteroid.semiMajorAxis)
  ),
]
