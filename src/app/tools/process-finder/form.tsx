'use client'

import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FC, useTransition } from 'react'
import { Plus, Trash } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import { WarehouseParam, warehousesParams } from './params'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ProcessFinderFormProps = {
  warehouses: WarehouseParam[]
}

const schema = z.object({
  warehouses: z.array(
    z.object({
      asteroidId: z.number(),
      lotId: z.number(),
    })
  ),
})

export const ProcessFinderForm: FC<ProcessFinderFormProps> = ({
  warehouses: initialWarehouses,
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      warehouses:
        initialWarehouses.length === 0
          ? [{ asteroidId: 1, lotId: 0 }]
          : initialWarehouses,
    },
  })
  const [loading, startTransition] = useTransition()
  const [, setWareHouses] = useQueryStates(warehousesParams, {
    startTransition,
    shallow: true,
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'warehouses',
  })

  return (
    <Form {...form}>
      <form
        className='flex w-fit flex-col gap-y-3'
        onSubmit={form.handleSubmit((d) => setWareHouses(d))}
      >
        <div>
          <h2>Warehouses</h2>
          {fields.map((field, index) => (
            <div key={field.id} className='flex items-end gap-x-3'>
              <FormField
                name={`warehouses.${index}.asteroidId`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asteroid ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        type='number'
                        className='max-w-40'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name={`warehouses.${index}.lotId`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          const n = parseInt(
                            e.target.value.replace(/[#|,]/g, '')
                          )
                          field.onChange(isNaN(n) ? '' : n)
                        }}
                        className='max-w-40'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type='button'
                variant='destructive'
                responsive
                icon=<Trash />
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          type='button'
          icon={<Plus />}
          variant='outline'
          onClick={() => append({ asteroidId: 1, lotId: 1 })}
        >
          Warehouse
        </Button>
        <Button
          className='flex-grow'
          type='submit'
          loading={loading}
          disabled={fields.length === 0}
        >
          Find Processes
        </Button>
      </form>
    </Form>
  )
}
