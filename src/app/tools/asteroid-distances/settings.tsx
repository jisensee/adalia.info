'use client'

import { useQueryStates } from 'nuqs'
import { asteroidDistancesParams } from './params'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Settings = () => {
  const [params, setParams] = useQueryStates(asteroidDistancesParams, {
    shallow: false,
  })

  return (
    <div className='flex gap-x-3'>
      <div>
        <Label>Time Range</Label>
        <Select
          value={params.realDaysToShow.toString()}
          onValueChange={(value) =>
            setParams({ realDaysToShow: parseInt(value) })
          }
        >
          <SelectTrigger className='w-40'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={'30'}>1 Month</SelectItem>
            <SelectItem value={'90'}>3 Months</SelectItem>
            <SelectItem value={'180'}>6 Months</SelectItem>
            <SelectItem value={'365'}>1 Year</SelectItem>
            <SelectItem value={'1095'}>3 Years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
