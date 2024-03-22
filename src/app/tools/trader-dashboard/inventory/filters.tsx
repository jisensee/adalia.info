import { FC } from 'react'
import { z } from 'zod'

import { Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export type TableFiltersProps = {
  asteroidNames: Map<number, string>
  warehouseNames: Map<number, string>
  filter: InventoryFilter
  onFilterChange: (filter: InventoryFilter) => void
}

const formSchema = z.object({
  product: z.string().optional(),
  asteroidId: z.number().nullish(),
  warehouseId: z.number().nullish(),
})

export type InventoryFilter = z.infer<typeof formSchema>

export const TableFilters: FC<TableFiltersProps> = ({
  asteroidNames,
  warehouseNames,
  filter,
  onFilterChange,
}) => {
  const productFilter = (
    <div className='w-full max-w-96 space-y-1'>
      <Label>Product</Label>
      <Input
        value={filter.product}
        onChange={(e) => onFilterChange({ ...filter, product: e.target.value })}
        className='w-full'
        placeholder='Product, Category or Classification'
      />
    </div>
  )
  const asteroidFilter = (
    <div className='w-full max-w-96 space-y-1'>
      <Label>Asteroid</Label>
      <Select
        value={filter.asteroidId?.toString() ?? '0'}
        onValueChange={(v) =>
          onFilterChange({
            ...filter,
            asteroidId: v === '0' ? null : parseInt(v, 10),
          })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key={'all'} value={'0'}>
            All
          </SelectItem>
          {[...asteroidNames.entries()].map(([id, name]) => (
            <SelectItem key={id} value={id.toString()}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
  const warehouseFilter = (
    <div className='w-full max-w-96 space-y-1'>
      <Label>Warehouse</Label>
      <Select
        value={filter.warehouseId?.toString() ?? '0'}
        onValueChange={(v) =>
          onFilterChange({
            ...filter,
            warehouseId: v === '0' ? null : parseInt(v, 10),
          })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key={'all'} value={'0'}>
            All
          </SelectItem>
          {[...warehouseNames.entries()].map(([id, name]) => (
            <SelectItem key={id} value={id.toString()}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className='flex flex-col gap-2 md:flex-row md:items-end'>
      {productFilter}
      {asteroidFilter}
      {warehouseFilter}
      <Button
        className='w-fit whitespace-nowrap'
        type='button'
        icon={<Trash size={18} />}
        variant='destructive'
        onClick={() =>
          onFilterChange({
            product: '',
            asteroidId: null,
            warehouseId: null,
          })
        }
      >
        Clear Filters
      </Button>
    </div>
  )
}
