'use client'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useRouter } from 'next/navigation'
import { GripVertical, TableProperties } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AsteroidColumn, getAsteroidColumnName } from './columns'
import {
  AsteroidsPageParams,
  buildAsteroidsUrl,
  defaultAsteroidColumnConfig,
} from './types'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

export type ColumnConfigProps = {
  params: AsteroidsPageParams
}

export const ColumnConfig = ({ params }: ColumnConfigProps) => {
  const [columns, setColumns] = useState(
    params.columns ?? defaultAsteroidColumnConfig
  )
  const { push } = useRouter()

  useEffect(() => {
    push(buildAsteroidsUrl({ ...params, columns }))
  }, [columns])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' icon={<TableProperties />}>
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-fit px-3'>
        <DndContext
          onDragEnd={({ active, over }) =>
            setColumns(
              arrayMove(
                columns,
                columns.findIndex((c) => c.id === active.id),
                columns.findIndex((c) => c.id === over?.id)
              )
            )
          }
        >
          <SortableContext items={columns}>
            <div className='flex flex-col gap-y-2'>
              {columns.map((col) => (
                <Row
                  key={col.id}
                  column={col.id}
                  active={col.active}
                  onActiveChange={(active) =>
                    setColumns(
                      columns.map((c) =>
                        c.id === col.id ? { ...c, active } : c
                      )
                    )
                  }
                />
              ))}
              <Button
                className='mt-2'
                onClick={() => setColumns(defaultAsteroidColumnConfig)}
              >
                Restore defaults
              </Button>
            </div>
          </SortableContext>
        </DndContext>
      </PopoverContent>
    </Popover>
  )
}

type RowProps = {
  column: AsteroidColumn
  active: boolean
  onActiveChange: (active: boolean) => void
}

const Row = ({ column, active, onActiveChange }: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      key={column}
      className='flex items-center gap-x-3'
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div {...listeners} className='mr-1'>
        <GripVertical />
      </div>
      <Checkbox
        id={column}
        checked={active}
        onCheckedChange={() => onActiveChange(!active)}
      />
      <label htmlFor={column}>{getAsteroidColumnName(column)}</label>
    </div>
  )
}