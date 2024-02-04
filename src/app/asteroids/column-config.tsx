'use client'

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { GripVertical, TableProperties } from 'lucide-react'
import { useMemo } from 'react'
import { AsteroidColumn, getAsteroidColumnName } from './columns'
import { defaultAsteroidColumnConfig } from './types'
import { useAsteroidColumns } from './hooks'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { StarkSightTokenResponse, starkSightColumns } from '@/lib/starksight'

export type ColumnConfigProps = {
  customColumns: StarkSightTokenResponse['columns']
}
export const ColumnConfig = ({ customColumns }: ColumnConfigProps) => {
  const [columns, setColumns] = useAsteroidColumns()
  const sensors = useSensors(useSensor(PointerSensor))

  const filteredColumns = useMemo(() => {
    // Filter out custom columns if they should not be shown
    const adjustedColumns = columns.filter((c) => {
      if (starkSightColumns.map((s) => s as string).includes(c.id)) {
        return customColumns.map((s) => s as string).includes(c.id)
      }
      return true
    })
    const newCols = starkSightColumns.flatMap((c) => {
      if (
        customColumns.map((s) => s as string).includes(c) &&
        !adjustedColumns.find((ac) => ac.id === c)
      ) {
        return [{ id: c, active: true }]
      }
      return []
    })
    return [...newCols, ...adjustedColumns]
  }, [customColumns, columns])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className='w-full sm:w-fit'
          variant='outline'
          icon={<TableProperties />}
          responsive
        >
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-fit px-3'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) =>
            setColumns(
              arrayMove(
                filteredColumns,
                filteredColumns.findIndex((c) => c.id === active.id),
                filteredColumns.findIndex((c) => c.id === over?.id)
              )
            )
          }
        >
          <SortableContext items={filteredColumns}>
            <div className='flex flex-col gap-y-2'>
              {filteredColumns.map((col) => (
                <Row
                  key={col.id}
                  column={col.id}
                  active={col.active}
                  onActiveChange={(active) =>
                    setColumns(
                      filteredColumns.map((c) =>
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
      <div className='mr-1' {...listeners}>
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
