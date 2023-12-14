'use client'

import { PropsWithChildren, ReactNode } from 'react'
import { XIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { AsteroidFilters, RangeParam } from './filter-params'

import { useAsteroidFilters } from './hooks'
import { Format } from '@/lib/format'
import { useAccounts } from '@/hooks/wallet-hooks'

export type AsteroidFilterSummaryProps = {
  readonly?: boolean
}

export const AsteroidFilterSummary = ({
  readonly,
}: AsteroidFilterSummaryProps) => {
  const [filters, setFilters] = useAsteroidFilters()

  const anyFilterActive = Object.values(filters).some((v) => v !== null)

  const { mainnetAccount, starknetAccount } = useAccounts()
  const mainnetAddress = mainnetAccount?.address
  const starknetAddress = starknetAccount?.address

  const connectedAddresses = [mainnetAddress, starknetAddress].filter(
    Boolean
  ) as string[]

  const tag = <Key extends keyof AsteroidFilters>(
    key: Key,
    name: string,
    format: (
      value: Exclude<AsteroidFilters[Key], null | undefined>
    ) => ReactNode
  ) => {
    const value = filters[key]

    return (
      value !== undefined &&
      value !== null && (
        <FilterTag
          name={name}
          onRemove={
            readonly ? undefined : () => setFilters({ ...filters, [key]: null })
          }
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {format(value as any)}
        </FilterTag>
      )
    )
  }

  const rangeTag = <Key extends keyof AsteroidFilters>(
    key: Key,
    name: string,
    format: (value: number) => string
  ) =>
    tag(key, name, (value) => {
      const { from, to } = value as RangeParam
      return format(from) + ' - ' + format(to)
    })

  const enumFormatter =
    <T,>(format: (value: T) => string) =>
    (value: T[]) =>
      value.map(format).join(', ')

  return anyFilterActive ? (
    <div className='flex flex-row flex-wrap items-center gap-2'>
      {tag('name', 'Name', (name) => name)}
      {tag('owned', 'Owned', (owned) => (owned ? 'Yes' : 'No'))}
      {tag('owners', 'Owner', (owners) => {
        const isConnectedOwner =
          owners.length === connectedAddresses.length &&
          (owners.some((v) => v && v === mainnetAddress) ||
            owners.some((v) => v && v === starknetAddress))

        return isConnectedOwner
          ? 'Me'
          : owners.map((o) => (o ? Format.ethAddress(o, 4) : '')).join(', ')
      })}
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
  ) : null
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
