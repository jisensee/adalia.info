'use client'
import NextImage from 'next/image'
import {
  Asteroid,
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
  Blockchain,
} from '@prisma/client'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { ReactNode } from 'react'
import Link from 'next/link'
import { Format } from '@/lib/format'
import { radiusToSurfaceArea } from '@/lib/utils'
import { Constants } from '@/lib/constants'

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
  earlyAdopter: boolean
  purchaseOrder?: number | null
  blockchain?: Blockchain | null
}

const getScanBonus = (purchaseOrder: number | null) => {
  if (!purchaseOrder) {
    return undefined
  }

  if (purchaseOrder < 100) {
    return 4
  } else if (purchaseOrder < 1_100) {
    return 3
  } else if (purchaseOrder < 11_100) {
    return 2
  } else {
    return 1
  }
}

const isEarlyAdopter = (purchaseOrder: number | null) =>
  purchaseOrder ? purchaseOrder < Constants.EARLY_ADOPTER_PURCHASE_ORDER : false

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
  earlyAdopter: isEarlyAdopter(asteroid.purchaseOrder),
  purchaseOrder: asteroid.purchaseOrder,
  blockchain: asteroid.blockchain,
})

export type AsteroidColumn = keyof AsteroidRow

export const allAsteroidColumns: AsteroidColumn[] = [
  'id',
  'name',
  'owner',
  'scanStatus',
  'earlyAdopter',
  'size',
  'radius',
  'spectralType',
  'rarity',
  'surfaceArea',
  'orbitalPeriod',
  'inclination',
  'eccentricity',
  'semiMajorAxis',
  'purchaseOrder',
  'purchaseOrder',
  'blockchain',
]

const columnNames: Record<AsteroidColumn, string> = {
  id: 'ID',
  name: 'Name',
  owner: 'Owner',
  scanStatus: 'Scan status',
  earlyAdopter: 'Early adopter',
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
  purchaseOrder: 'Purchase order',
  blockchain: 'Chain',
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

const renderBlockchain = (blockchain: Blockchain) =>
  blockchain === Blockchain.ETHEREUM ? (
    <NextImage
      src='/ethereum-logo.svg'
      width={24}
      height={24}
      alt='Ethereum logo'
    />
  ) : (
    <NextImage
      src='/starknet-logo.webp'
      width={24}
      height={24}
      alt='StarkNet logo'
    />
  )

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
    asteroid.scanBonus ? Format.asteroidScanBonus(asteroid.scanBonus) : ''
  ),
  col('purchaseOrder', (asteroid) =>
    asteroid.purchaseOrder ? Format.purchaseOrder(asteroid.purchaseOrder) : ''
  ),
  col('earlyAdopter', (asteroid) => (asteroid.earlyAdopter ? 'Yes' : 'No')),
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
  col('blockchain', (asteroid) =>
    asteroid.blockchain ? renderBlockchain(asteroid.blockchain) : ''
  ),
]
