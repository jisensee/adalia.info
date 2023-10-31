'use client'

import { Asteroid } from '@prisma/client'
import { ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { ReactNode } from 'react'
import { Format } from '@/lib/format'

const colHelper = createColumnHelper<Asteroid>()

const col = (
  id: string,
  header: string,
  render: (asteroid: Asteroid) => ReactNode
): ColumnDef<Asteroid> =>
  colHelper.display({
    id,
    header,
    cell: (props) => render(props.row.original),
  })

export const columns: ColumnDef<Asteroid>[] = [
  col('id', 'ID', (asteroid) => (
    <span className='text-primary'>{asteroid.id}</span>
  )),
  col('name', 'Name', (asteroid) => asteroid.name),
  col('ownerAddress', 'Owner', (asteroid) =>
    asteroid.ownerAddress ? Format.ethAddress(asteroid.ownerAddress, 4) : ''
  ),
  col('radius', 'Radius', (asteroid) => Format.radius(asteroid.radius)),
  col('spectralType', 'Type', (asteroid) => asteroid.spectralType),
  col('surfaceArea', 'Area', (asteroid) =>
    Format.surfaceArea(asteroid.surfaceArea)
  ),
  col('orbitalPeriod', 'Orbital Period', (asteroid) =>
    Format.orbitalPeriod(asteroid.orbitalPeriod)
  ),
  col('inclination', 'Inclination', (asteroid) =>
    Format.inclination(asteroid.inclination)
  ),
  col('eccentricity', 'Eccentricity', (asteroid) =>
    Format.eccentricity(asteroid.eccentricity)
  ),
  col('semiMajorAxis', 'Semi Major Axis', (asteroid) =>
    Format.semiMajorAxis(asteroid.semiMajorAxis)
  ),
]
