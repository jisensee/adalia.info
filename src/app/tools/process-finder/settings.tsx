'use client'

import { useQueryStates } from 'nuqs'
import { FC, useMemo } from 'react'
import { settingsParams } from './params'
import { Warehouse } from './state'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { groupArrayBy } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export type SettingsProps = {
  warehouses: Warehouse[]
}

export const Settings: FC<SettingsProps> = ({ warehouses }) => {
  const [
    {
      hideLowAmounts,
      hideWithoutProcesses,
      restrictToAsteroid,
      warehouses: warehousesParam,
    },
    setSettings,
  ] = useQueryStates(settingsParams)

  const groupedWarehouses = groupArrayBy(warehouses, (w) => w.asteroid)
  // const groupedSelectedWarehouses =

  const toggleWarehouse = (id: number) =>
    setSettings({
      warehouses: warehousesParam?.includes(id)
        ? warehousesParam.filter((w) => w !== id)
        : [...(warehousesParam ?? []), id],
    })

  const toggleAsteroid = (asteroid: string, checked: boolean) => {
    const asteroidWarehouses = (groupedWarehouses.get(asteroid) ?? []).map(
      (wh) => wh.id
    )
    if (checked) {
      setSettings({
        warehouses: [
          ...new Set([...(warehousesParam ?? []), ...asteroidWarehouses]),
        ],
      })
    } else {
      setSettings({
        warehouses: warehousesParam?.filter(
          (id) => !asteroidWarehouses.includes(id)
        ),
      })
    }
  }
  const selectAsteroid = (asteroid: string) =>
    setSettings({
      warehouses:
        asteroid === 'all'
          ? null
          : groupedWarehouses.get(asteroid)?.map((wh) => wh.id),
    })

  const asteroidOptions = [...new Set(warehouses.map((w) => w.asteroid))]
  const fullSelectedAsteroids = asteroidOptions.filter(
    (asteroid) =>
      groupedWarehouses
        .get(asteroid)
        ?.every((wh) => warehousesParam?.includes(wh.id)) ?? false
  )
  const selectedAsteroid = useMemo(() => {
    if (!warehousesParam || warehousesParam.length === warehouses.length) {
      return 'all'
    }
    return fullSelectedAsteroids.length === 1
      ? fullSelectedAsteroids[0]
      : undefined
  }, [fullSelectedAsteroids, warehouses.length, warehousesParam])

  const asteroidSelect = (
    <Select
      value={selectedAsteroid}
      onValueChange={(value) => selectAsteroid(value)}
    >
      <SelectTrigger className='w-full md:w-96'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All</SelectItem>
        {asteroidOptions.map((asteroid) => (
          <SelectItem key={asteroid} value={asteroid}>
            {asteroid}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const warehouseList = (
    <div className='flex flex-wrap gap-x-5 gap-y-2'>
      {[...groupedWarehouses.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([asteroid, warehouses]) => (
          <div key={asteroid} className='space-y-1'>
            <div className='flex items-center gap-x-2'>
              <Checkbox
                id={asteroid}
                checked={fullSelectedAsteroids.includes(asteroid)}
                onCheckedChange={(checked) =>
                  toggleAsteroid(asteroid, !!checked)
                }
              />
              <Label htmlFor={asteroid} className='text-2xl'>
                {asteroid}
              </Label>
            </div>
            <div className='flex flex-col gap-2'>
              {warehouses.map((wh) => (
                <div key={wh.id} className='flex items-center gap-2'>
                  <Checkbox
                    id={wh.id.toString()}
                    checked={warehousesParam?.includes(wh.id)}
                    onCheckedChange={() => toggleWarehouse(wh.id)}
                  />
                  <Label htmlFor={wh.id.toString()}>{wh.name}</Label>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  )

  const settings = (
    <div className='space-y-2'>
      <div className='flex items-center gap-x-2'>
        <Switch
          id='hideLowAmounts'
          checked={hideLowAmounts}
          onCheckedChange={(checked) =>
            setSettings({ hideLowAmounts: checked })
          }
        />
        <Label htmlFor='hideLowAmounts'>Hide products with low amounts</Label>
      </div>
      <div className='flex items-center gap-x-2'>
        <Switch
          id='hideWithoutProcesses'
          checked={hideWithoutProcesses}
          onCheckedChange={(checked) =>
            setSettings({ hideWithoutProcesses: checked })
          }
        />
        <Label htmlFor='hideWithoutProcesses'>
          Hide products without matching process
        </Label>
      </div>
      <div className='flex items-center gap-x-2'>
        <Switch
          id='restrictToAsteroid'
          checked={restrictToAsteroid}
          onCheckedChange={(checked) =>
            setSettings({ restrictToAsteroid: checked })
          }
        />
        <Label htmlFor='restrictToAsteroid'>
          Restrict input products to their asteroid
        </Label>
      </div>
    </div>
  )

  return (
    <div className='flex flex-col gap-y-3'>
      <Accordion defaultValue={[]} type='multiple'>
        <AccordionItem value='settings'>
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>{settings}</AccordionContent>
        </AccordionItem>
        <AccordionItem value='warehouses'>
          <div className='flex items-center gap-x-5'>
            <AccordionTrigger>Warehouses</AccordionTrigger>
            {asteroidSelect}
          </div>
          <AccordionContent>{warehouseList}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
