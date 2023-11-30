import { ReactNode, useEffect, useId, useState } from 'react'
import { Checkbox } from '../ui/checkbox'

export type FilterProps<T> = {
  value?: T | null
  defaultValue: T
  onChange: (value: T | null) => void
  name: string
  children: (props: {
    value: T
    onChange: (value: T) => void
    disabled: boolean
  }) => ReactNode
}

export const Filter = <T,>({
  value,
  defaultValue,
  onChange,
  name,
  children,
}: FilterProps<T>) => {
  const [lastValue, setLastValue] = useState(value ?? defaultValue)
  const [active, setActive] = useState(value !== undefined && value !== null)
  const id = useId()

  useEffect(() => {
    if (value === undefined || value === null) {
      setActive(false)
    }
  }, [value])

  return (
    <div className='flex flex-col gap-y-3'>
      <div className='flex items-center gap-x-2'>
        <Checkbox
          id={id}
          checked={active}
          onCheckedChange={() => {
            setActive(!active)
            onChange(active ? null : lastValue)
          }}
        />
        <label htmlFor={id}>{name}</label>
      </div>
      {children({
        value: value ?? lastValue,
        onChange: (value) => {
          if (value) {
            setLastValue(value)
          }
          onChange(value)
        },
        disabled: !active,
      })}
    </div>
  )
}
