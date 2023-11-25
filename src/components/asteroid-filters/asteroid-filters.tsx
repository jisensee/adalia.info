import { Blockchain } from '@prisma/client'
import Image from 'next/image'
import { Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { FormControl } from '../ui/form'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Slider } from '../ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Button } from '../ui/button'
import { Filter } from './filter'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/wallet-hooks'

export type AsteroidFilterProps<T> = {
  value: T | undefined | null
  onChange: (value?: T) => void
}

export type StringFilterProps = AsteroidFilterProps<string> & {
  name: string
}
export const StringFilter = (props: StringFilterProps) => (
  <Filter {...props} defaultValue={''}>
    {({ value, onChange, disabled }) => (
      <FormControl>
        <Input
          placeholder={props.name}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          disabled={disabled}
        />
      </FormControl>
    )}
  </Filter>
)

export const OwnerFilter = (props: AsteroidFilterProps<string[]>) => {
  const { mainnetAccount, starknetAccount } = useAccounts()
  const mainnetAddress = mainnetAccount?.address
  const starknetAddress = starknetAccount?.address

  const connectedAddresses = [mainnetAddress, starknetAddress].filter(
    Boolean
  ) as string[]
  const [customOwner, setCustomOwner] = useState('')

  return (
    <Filter {...props} name='Owners' defaultValue={connectedAddresses}>
      {({ value, onChange, disabled }) => {
        const isConnectedOwner =
          value.length === connectedAddresses.length &&
          (value.some((v) => v && v === mainnetAddress) ||
            value.some((v) => v && v === starknetAddress))

        const customOwners = (
          <div className='flex flex-col gap-3'>
            {value.map((owner) => (
              <div key={owner} className='flex flex-row items-center gap-x-2'>
                <p className='truncate'>{owner}</p>
                <Button
                  icon={<Trash />}
                  size='icon'
                  disabled={disabled}
                  onClick={() => onChange(value.filter((v) => v !== owner))}
                />
              </div>
            ))}
            <div className='flex flex-row items-center gap-x-3'>
              <Input
                placeholder='Owner address'
                value={customOwner}
                onChange={(e) => setCustomOwner(e.target.value)}
                disabled={disabled}
              />
              <Button
                type='button'
                icon={<Plus />}
                size='icon'
                disabled={disabled}
                onClick={() => {
                  onChange([...value, customOwner])
                  setCustomOwner('')
                }}
              />
            </div>
          </div>
        )

        const connectedOwner = (
          <div className='flex flex-col gap-3'>
            {mainnetAddress && (
              <div className='flex flex-row items-center gap-2'>
                <Image
                  src='/ethereum-logo.svg'
                  width={25}
                  height={25}
                  alt='ethereum logo'
                />
                <p className='truncate'>{mainnetAddress}</p>
              </div>
            )}
            {starknetAddress && (
              <div className='flex flex-row items-center gap-2'>
                <Image
                  src='/starknet-logo.webp'
                  width={25}
                  height={25}
                  alt='starknet logo'
                />
                <p className='truncate'>{starknetAddress}</p>
              </div>
            )}
          </div>
        )

        return (
          <FormControl>
            {!mainnetAddress && !starknetAddress ? (
              customOwners
            ) : (
              <Tabs
                value={isConnectedOwner ? 'connected' : 'custom'}
                onValueChange={(v) => {
                  if (v === 'connected') {
                    onChange(connectedAddresses)
                  } else {
                    onChange([''])
                  }
                }}
              >
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='custom' disabled={disabled}>
                    Custom
                  </TabsTrigger>
                  <TabsTrigger value='connected' disabled={disabled}>
                    Owned by me
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='connected'>{connectedOwner}</TabsContent>
                <TabsContent value='custom'>{customOwners}</TabsContent>
              </Tabs>
            )}
          </FormControl>
        )
      }}
    </Filter>
  )
}

export const BlockchainFilter = (props: AsteroidFilterProps<Blockchain>) => (
  <Filter {...props} defaultValue={Blockchain.ETHEREUM} name='Blockchain'>
    {({ value, onChange, disabled }) => (
      <Select
        defaultValue={value}
        onValueChange={(value) => onChange(value as Blockchain)}
        disabled={disabled}
      >
        <SelectTrigger className='w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={Blockchain.ETHEREUM}>Ethereum</SelectItem>
          <SelectItem value={Blockchain.STARKNET}>StarkNet</SelectItem>
        </SelectContent>
      </Select>
    )}
  </Filter>
)

export const OwnedFilter = (props: AsteroidFilterProps<boolean>) => (
  <Filter {...props} defaultValue={true} name='Ownership'>
    {({ value, onChange, disabled }) => (
      <Select
        defaultValue={value ? 'owned' : 'unowned'}
        onValueChange={(value) => onChange(value === 'owned')}
        disabled={disabled}
      >
        <SelectTrigger className='w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='owned'>Owned</SelectItem>
          <SelectItem value='unowned'>Unowned</SelectItem>
        </SelectContent>
      </Select>
    )}
  </Filter>
)

export type BooleanFilterProps = AsteroidFilterProps<boolean> & {
  name: string
}
export const BooleanFilter = ({ name, ...filterProps }: BooleanFilterProps) => (
  <Filter {...filterProps} defaultValue={true} name={name}>
    {({ value, onChange, disabled }) => (
      <Select
        defaultValue={value ? 'yes' : 'no'}
        onValueChange={(value) => onChange(value === 'yes')}
        disabled={disabled}
      >
        <SelectTrigger className='w-32'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='yes'>Yes</SelectItem>
          <SelectItem value='no'>No</SelectItem>
        </SelectContent>
      </Select>
    )}
  </Filter>
)

export type RangeFilterProps = AsteroidFilterProps<[number, number]> & {
  name: string
  min: number
  max: number
  step: number
  unit: string
}
export const RangeFilter = ({
  min,
  max,
  step,
  unit,
  ...filterProps
}: RangeFilterProps) => (
  <Filter {...filterProps} defaultValue={[min, max]}>
    {({ value: [from, to], onChange, disabled }) => (
      <div className='flex flex-col gap-y-2'>
        <Slider
          value={[from, to]}
          onValueChange={(v) => onChange(v as [number, number])}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
        />
        <span>
          {from} {unit} - {to} {unit}
        </span>
      </div>
    )}
  </Filter>
)

export type EnumFilterProps<T> = AsteroidFilterProps<T[]> & {
  name: string
  options: T[]
  format: (value: T) => string
}

export const EnumFilter = <T extends string>({
  options,
  format,
  ...filterProps
}: EnumFilterProps<T>) => (
  <Filter {...filterProps} defaultValue={[]}>
    {({ value, onChange, disabled }) => (
      <div className='flex flex-row flex-wrap items-center gap-2'>
        {options.map((option) => (
          <div
            className={cn('cursor-pointer rounded-lg border px-3 py-2', {
              'border-primary': value.includes(option),
              'cursor-not-allowed opacity-50': disabled,
            })}
            key={option}
            onClick={() => {
              if (disabled) {
                return
              }
              if (value.includes(option)) {
                onChange(value.filter((v) => v !== option))
              } else {
                onChange([...value, option])
              }
            }}
          >
            {format(option)}
          </div>
        ))}
      </div>
    )}
  </Filter>
)
