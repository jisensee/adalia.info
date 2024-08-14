'use client'

import { useQueryStates } from 'nuqs'
import { Building } from '@influenceth/sdk'
import { publicBuildingsParams } from './params'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AsteroidSelect } from '@/components/asteroid-select'

const allowedBuildingTypes = [
  Building.IDS.EXTRACTOR,
  Building.IDS.FACTORY,
  Building.IDS.REFINERY,
  Building.IDS.SHIPYARD,
  Building.IDS.BIOREACTOR,
]

export const PublicBuildingFilters = () => {
  const [params, setParams] = useQueryStates(publicBuildingsParams, {
    shallow: false,
  })

  const buildingTypeSelect = (
    <div>
      <Label>Building Type</Label>
      <Select
        value={params.buildingType?.toString()}
        onValueChange={(value) => setParams({ buildingType: parseInt(value) })}
      >
        <SelectTrigger className='w-40'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowedBuildingTypes.map((type) => (
            <SelectItem key={type} value={type.toString()}>
              {Building.getType(type).name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const parseLotNumber = (lotNumber: string) => {
    const replaced = lotNumber.replace(/[^\d]/g, '')
    return replaced.length === 0 ? null : parseInt(replaced)
  }

  const asteroidSelect = (
    <div>
      <Label>Asteroid</Label>
      <AsteroidSelect
        asteroidId={params.asteroidId}
        onAsteroidIdChange={(id) =>
          setParams({ asteroidId: id, habitatLotIndex: null })
        }
      />
    </div>
  )

  const habitatLotIndexInput = (
    <div>
      <Label>Crew Habitat Lot Number</Label>
      <Input
        className='w-40'
        value={params.habitatLotIndex ? params.habitatLotIndex.toString() : ''}
        onChange={(e) =>
          setParams({
            habitatLotIndex: parseLotNumber(e.target.value),
          })
        }
      />
    </div>
  )

  const busyToggle = (
    <div className='flex items-center gap-x-2'>
      <Label htmlFor='show-busy-buildings'>Show busy buildings</Label>
      <Switch
        id='show-busy-buildings'
        checked={!!params.showBusyBuildings}
        onCheckedChange={(checked) => setParams({ showBusyBuildings: checked })}
      />
    </div>
  )

  return (
    <div className='flex flex-col gap-y-3'>
      <div className='flex flex-wrap gap-3'>
        {buildingTypeSelect}
        {asteroidSelect}
        {habitatLotIndexInput}
      </div>
      <div className='flex flex-wrap gap-x-5 gap-y-3'>
        {busyToggle}
        <p>
          <span className='mr-1 font-bold text-primary'>Tip:</span>Enter the lot
          number of your crew&apos;s habitat to see their distance to the
          buildings.
        </p>
      </div>
    </div>
  )
}
