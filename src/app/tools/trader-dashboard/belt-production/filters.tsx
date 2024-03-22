'use client'

import { useQueryStates } from 'nuqs'
import { useState, useTransition } from 'react'
import { Save, Trash } from 'lucide-react'
import { beltProductionParams } from '../params'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const BeltProductionFilters = () => {
  const [loading, startTransition] = useTransition()
  const [{ asteroidId }, setAsteroid] = useQueryStates(beltProductionParams, {
    shallow: false,
    startTransition,
  })
  const [{ productSearch }, setProductSearch] =
    useQueryStates(beltProductionParams)
  const [formValue, setFormValue] = useState(asteroidId?.toString())

  return (
    <div className='flex flex-col gap-3 md:flex-row md:items-end'>
      <div className='w-full space-y-1 md:w-96'>
        <Label>Product</Label>
        <Input
          value={productSearch ?? ''}
          onChange={(e) => setProductSearch({ productSearch: e.target.value })}
          placeholder='Product, Category or Classification'
        />
      </div>
      <form
        className='flex flex-row items-end gap-x-3'
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setAsteroid({ asteroidId: parseInt(formValue ?? '0', 10) })
        }}
      >
        <div className='w-full space-y-1 md:w-auto'>
          <Label>Asteroid ID</Label>
          <Input
            type='number'
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
        </div>
        <Button
          disabled={!formValue}
          loading={loading}
          type='submit'
          icon={<Save />}
        >
          Apply
        </Button>
      </form>
      <Button
        type='button'
        variant='destructive'
        icon={<Trash />}
        onClick={() => setAsteroid({ asteroidId: null, productSearch: null })}
      >
        Reset
      </Button>
    </div>
  )
}
