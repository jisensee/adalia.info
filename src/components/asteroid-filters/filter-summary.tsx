'use client'

import { decodeQueryParams } from 'serialize-query-params'
import { PropsWithChildren, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { XIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
  AsteroidFilterParams,
  asteroidFilterParamsConfig,
} from './filter-params'
import { buildAsteroidsUrl } from '@/app/asteroids/types'
import { Format } from '@/lib/format'

export type AsteroidFilterSummaryProps = {
  searchParams: Record<string, string | string[]>
}

export const AsteroidFilterSummary = ({
  searchParams,
}: AsteroidFilterSummaryProps) => {
  const params = decodeQueryParams(asteroidFilterParamsConfig, searchParams)
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
          onRemove={() => push(buildAsteroidsUrl({ ...params, [key]: null }))}
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

  return (
    <div className='flex flex-row items-center gap-2'>
      {tag('owned', 'Owned', (owned) => (owned ? 'Yes' : 'No'))}
      {tag('owner', 'Owner', (owner) => Format.ethAddress(owner, 4))}
      {rangeTag('radius', 'Radius', Format.radius)}
      {rangeTag('surfaceArea', 'Surface area', Format.surfaceArea)}
      {rangeTag('orbitalPeriod', 'Orbital period', Format.orbitalPeriod)}
      {rangeTag('semiMajorAxis', 'semiMajorAxis', Format.semiMajorAxis)}
      {rangeTag('inclination', 'Inclination', Format.inclination)}
      {rangeTag('eccentricity', 'Eccentricity', Format.eccentricity)}
    </div>
  )
}

type FilterTagProps = {
  name: string
  onRemove: () => void
} & PropsWithChildren

const FilterTag = ({ name, onRemove, children }: FilterTagProps) => (
  <div className='flex flex-row items-center gap-x-2 rounded-lg border border-primary px-3 py-1 text-sm'>
    <span className='text-primary'>{name}:</span>
    {children}
    <Button className='p-0' variant='ghost' size='sm' onClick={onRemove}>
      <XIcon size={20} />
    </Button>
  </div>
)
