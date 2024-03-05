'use client'

import { useQueryStates } from 'nuqs'
import { settingsParams } from './params'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export const Settings = () => {
  const [{ hideLowAmounts, hideWithoutProcesses }, setSettings] =
    useQueryStates(settingsParams)

  return (
    <div className='flex flex-col gap-y-3'>
      <div>
        <h2>Settings</h2>
        <p className='text-sm'>
          Too many products in your warehouses? Turn on those filters to reduce
          the list.
        </p>
      </div>
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
    </div>
  )
}
