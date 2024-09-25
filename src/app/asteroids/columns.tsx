'use client'
import {
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
import { Constants } from '@/lib/constants'
import { Logo } from '@/components/logo'
import { Address } from '@/components/address'
import { AsteroidWithCustomColumns } from '@/server/asteroid-service'

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
  salePrice?: number | null
  starkSightUser?: string | null
  starkSightGroup?: string | null
  totalBuildings?: number | null
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

export const toAsteroidRow = (
  asteroid: AsteroidWithCustomColumns
): AsteroidRow => ({
  id: asteroid.id,
  name: asteroid.name,
  owner: asteroid.ownerAddress,
  starkSightUser: asteroid.starkSightUser,
  starkSightGroup: asteroid.starkSightGroup,
  size: asteroid.size,
  radius: asteroid.radius,
  surfaceArea: asteroid.surfaceArea,
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
  totalBuildings: asteroid.totalBuildings,
})

export type AsteroidColumn = keyof AsteroidRow

export const allAsteroidColumns: AsteroidColumn[] = [
  'id',
  'starkSightUser',
  'starkSightGroup',
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
  'salePrice',
  'totalBuildings',
]

const columnNames: Record<AsteroidColumn, string> = {
  id: 'ID',
  starkSightUser: 'StarkSight User',
  starkSightGroup: 'StarkSight Group',
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
  salePrice: 'Sale price',
  totalBuildings: 'Total buildings',
}

export const getAsteroidColumnName = (col: AsteroidColumn): string =>
  columnNames[col]

export const nonSortableColumns: AsteroidColumn[] = [
  'owner',
  'scanStatus',
  'spectralType',
  'starkSightUser',
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
  col('starkSightUser', (asteroid) => asteroid.starkSightUser),
  col('starkSightGroup', (asteroid) => asteroid.starkSightGroup),
  col('owner', (asteroid) =>
    asteroid.owner ? (
      <Address address={asteroid.owner} shownCharacters={2} />
    ) : (
      ''
    )
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
  col('surfaceArea', (asteroid) => Format.surfaceArea(asteroid.surfaceArea)),
  col('orbitalPeriod', (asteroid) =>
    Format.orbitalPeriod(asteroid.orbitalPeriod)
  ),
  col('inclination', (asteroid) => Format.inclination(asteroid.inclination)),
  col('eccentricity', (asteroid) => Format.eccentricity(asteroid.eccentricity)),
  col('semiMajorAxis', (asteroid) =>
    Format.semiMajorAxis(asteroid.semiMajorAxis)
  ),
  col(
    'blockchain',
    (asteroid) =>
      asteroid.blockchain && (
        <Logo.Blockchain blockchain={asteroid.blockchain} size={24} />
      )
  ),
  col('salePrice', (asteroid) =>
    asteroid.salePrice ? Format.salePrice(asteroid.salePrice) : undefined
  ),
  col('totalBuildings', (asteroid) =>
    asteroid.totalBuildings?.toLocaleString()
  ),
]
