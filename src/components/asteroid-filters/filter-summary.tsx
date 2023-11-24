'use client'

import { decodeQueryParams } from 'serialize-query-params'
import { PropsWithChildren, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { XIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { AsteroidFilterParams } from './filter-params'
import {
  asteroidsPageParamConfig,
  buildAsteroidsUrl,
} from '@/app/asteroids/types'
import { Format } from '@/lib/format'

export type AsteroidFilterSummaryProps = {
  searchParams: Record<string, string | string[]>
  readonly?: boolean
}

export const AsteroidFilterSummary = ({
  searchParams,
  readonly,
}: AsteroidFilterSummaryProps) => {
  const params = decodeQueryParams(asteroidsPageParamConfig, searchParams)
  const { push } = useRouter()

  const tag = <Key extends keyof AsteroidFilterParams>(
    key: Key,
    name: string,
    format: (
      value: Exclude<AsteroidFilterParams[Key], null | undefined>
    ) => ReactNode
  ) => {
    const value = params[key]

    return (
      value !== undefined &&
      value !== null && (
        <FilterTag
          name={name}
          onRemove={
            readonly
              ? undefined
              : () => push(buildAsteroidsUrl({ ...params, [key]: null }))
          }
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {format(value as any)}
        </FilterTag>
      )
    )
  }

  const rangeTag = <Key extends keyof AsteroidFilterParams>(
    key: Key,
    name: string,
    format: (value: number) => string
  ) =>
    tag(key, name, (value) => {
      const [from, to] = value as [number, number]
      return format(from) + ' - ' + format(to)
    })

  const enumFormatter =
    <T,>(format: (value: T) => string) =>
    (value: T[]) =>
      value.map(format).join(', ')

  return (
    <div className='flex flex-row flex-wrap items-center gap-2'>
      {tag('owned', 'Owned', (owned) => (owned ? 'Yes' : 'No'))}
      {tag('owner', 'Owner', (owner) => Format.ethAddress(owner, 4))}
      {tag('scanStatus', 'Scan', enumFormatter(Format.asteroidScanStatus))}
      {tag('rarity', 'Rarity', enumFormatter(Format.asteroidRarity))}
      {tag(
        'spectralType',
        'Spectral type',
        enumFormatter(Format.asteroidSpectralType)
      )}
      {tag('size', 'Size', enumFormatter(Format.asteroidSize))}
      {rangeTag('radius', 'Radius', Format.radius)}
      {rangeTag('surfaceArea', 'Surface area', Format.surfaceArea)}
      {rangeTag('orbitalPeriod', 'Orbital period', Format.orbitalPeriod)}
      {rangeTag('semiMajorAxis', 'semiMajorAxis', Format.semiMajorAxis)}
      {rangeTag('inclination', 'Inclination', Format.inclination)}
      {rangeTag('eccentricity', 'Eccentricity', Format.eccentricity)}
      {rangeTag('purchaseOrder', 'Purchase order', Format.purchaseOrder)}
      {tag('earlyAdopter', 'Early adopter', (earlyAdopter) =>
        earlyAdopter ? 'Yes' : 'No'
      )}
      {tag('scanBonus', 'Scan bonus', enumFormatter(Format.asteroidScanBonus))}
      {tag('blockchain', 'Blockchain', (v) => v)}
    </div>
  )
}

type FilterTagProps = {
  name: string
  onRemove?: () => void
} & PropsWithChildren

const FilterTag = ({ name, onRemove, children }: FilterTagProps) => (
  <div className='flex flex-row items-center gap-x-2 rounded-lg border border-primary px-3 text-sm'>
    <span className='text-primary'>{name}:</span>
    {children}
    {onRemove && (
      <Button className='p-0' variant='ghost' size='sm' onClick={onRemove}>
        <XIcon size={20} />
      </Button>
    )}
  </div>
)
