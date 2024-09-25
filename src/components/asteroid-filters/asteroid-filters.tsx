import { Blockchain } from '@prisma/client'
import { Minus, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { useAtom } from 'jotai'
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
import { Logo } from '../logo'
import { Toggle } from '../ui/toggle'
import { Filter } from './filter'
import { RangeParam, StarkSightTokenParam } from './filter-params'
import { useAccounts } from '@/hooks/wallet-hooks'
import { decodeStarkSightToken } from '@/lib/starksight'
import { starkSightTokensAtom } from '@/hooks/atoms'

export type AsteroidFilterProps<T> = {
  value?: T | null
  onChange: (value: T | null) => void
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

  const connectedAddresses = [mainnetAddress, starknetAddress].flatMap((a) =>
    a ? [a] : []
  )
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
                <span className='truncate'>{owner}</span>
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
                <Logo.Ethereum size={25} />
                <p className='truncate'>{mainnetAddress}</p>
              </div>
            )}
            {starknetAddress && (
              <div className='flex flex-row items-center gap-2'>
                <Logo.StarkNet size={25} />
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
                    onChange([])
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

export type RangeFilterProps = AsteroidFilterProps<RangeParam> & {
  name: string
  min: number
  max: number
  step: number
  logScale?: boolean
  formatValue: (value: number) => string
}
type RangeFilterMode = 'slider' | 'input'
export const RangeFilter = ({
  min,
  max,
  step,
  formatValue,
  logScale,
  ...filterProps
}: RangeFilterProps) => {
  const [mode, setMode] = useState<RangeFilterMode>('slider')
  return (
    <Filter
      {...filterProps}
      defaultValue={{ from: min, to: max }}
      additionalHeader={
        <div className='flex w-full items-center justify-end gap-x-3'>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as RangeFilterMode)}
          >
            <TabsList className='!h-8'>
              <TabsTrigger className='text-xs' value='slider'>
                Slider
              </TabsTrigger>
              <TabsTrigger className='text-xs' value='input'>
                Input
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      }
    >
      {({ value: { from, to }, onChange, disabled }) => (
        <>
          {mode === 'slider' && (
            <div className='flex flex-col gap-y-2'>
              <Slider
                value={[from, to]}
                onValueChange={([a, b]) =>
                  a && b && onChange({ from: a, to: b })
                }
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                logScale={logScale}
              />
              <span>
                {formatValue(from)} - {formatValue(to)}
              </span>
            </div>
          )}
          {mode === 'input' && (
            <div className='flex items-center gap-x-3'>
              <Input
                type='number'
                disabled={disabled}
                min={min}
                max={max}
                value={from}
                onChange={(e) =>
                  onChange({ from: parseFloat(e.target.value), to })
                }
              />
              <Minus />
              <Input
                type='number'
                disabled={disabled}
                min={min}
                max={max}
                value={to}
                onChange={(e) =>
                  onChange({ from, to: parseFloat(e.target.value) })
                }
              />
            </div>
          )}
        </>
      )}
    </Filter>
  )
}

export type EnumFilterProps<T> = AsteroidFilterProps<T[]> & {
  name: string
  options: T[]
  format: (value: T) => string
}

export const EnumFilter = <T extends string | number>({
  options,
  format,
  ...filterProps
}: EnumFilterProps<T>) => (
  <Filter {...filterProps} defaultValue={[]}>
    {({ value, onChange, disabled }) => (
      <div className='flex flex-row flex-wrap items-center gap-2'>
        {options.map((option) => (
          <Toggle
            key={option}
            variant='outline'
            disabled={disabled}
            pressed={value.includes(option)}
            onPressedChange={(pressed) => {
              if (pressed) {
                onChange([...value, option])
              } else {
                onChange(value.filter((v) => v !== option))
              }
            }}
          >
            {format(option)}
          </Toggle>
        ))}
      </div>
    )}
  </Filter>
)

export const StarkSightTokenFilter = (
  props: AsteroidFilterProps<StarkSightTokenParam>
) => {
  const [starkSightTokens] = useAtom(starkSightTokensAtom)

  const defaultToken = props.value?.token ?? starkSightTokens[0]?.token

  if (!defaultToken) {
    return null
  }

  return (
    <Filter
      {...props}
      defaultValue={{
        token: defaultToken,
        name: decodeStarkSightToken(defaultToken),
      }}
      name='StarkSight Selection'
    >
      {({ value, onChange, disabled }) => (
        <Select
          defaultValue={value.token}
          onValueChange={(value) =>
            onChange({
              token: value,
              name: decodeStarkSightToken(value),
            })
          }
          disabled={disabled}
        >
          <SelectTrigger className='w-full border-starksight'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {starkSightTokens.map(({ token }) => (
              <SelectItem key={token} value={token}>
                {decodeStarkSightToken(token)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Filter>
  )
}
