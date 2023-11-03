'use client'

import { useRouter } from 'next/navigation'
import { allAsteroidColumns, getAsteroidColumnName } from './columns'
import { AsteroidsPageParams, buildAsteroidsUrl } from './types'
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
  const columns = params.columns ?? []
  const { push } = useRouter()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Columns</Button>
      </PopoverTrigger>
      <PopoverContent align='end'>
        <div className='flex flex-col gap-y-1'>
          {allAsteroidColumns.map((col) => (
            <div key={col} className='flex items-center gap-x-2'>
              <Checkbox
                id={col}
                checked={columns.includes(col)}
                onCheckedChange={() => {
                  push(
                    buildAsteroidsUrl({
                      ...params,
                      columns: columns.includes(col)
                        ? columns.filter((c) => c !== col)
                        : [...columns, col],
                    })
                  )
                }}
              />
              <label htmlFor={col}>{getAsteroidColumnName(col)}</label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
