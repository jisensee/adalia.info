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
import { Filter } from './filter'
import { cn } from '@/lib/utils'

export type AsteroidFilterProps<T> = {
  value: T | undefined | null
  onChange: (value?: T) => void
}

export const OwnerFilter = (props: AsteroidFilterProps<string>) => (
  <Filter {...props} name='Owner' defaultValue=''>
    {({ value, onChange, disabled }) => (
      <FormControl>
        <Input
          placeholder='Owner'
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </FormControl>
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
