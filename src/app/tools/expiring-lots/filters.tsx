import { Building } from '@influenceth/sdk'
import { A, D, pipe } from '@mobily/ts-belt'
import { ExpiringLotsParams } from './params'
import { AsteroidSelect } from '@/components/asteroid-select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { InfoTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useAccounts } from '@/hooks/wallet-hooks'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ExpiringLotsFiltersProps = {
  filters: ExpiringLotsParams
  onFiltersChange: (filters: Partial<ExpiringLotsParams>) => void
}

export const ExpiringLotsFilters = ({
  filters,
  onFiltersChange,
}: ExpiringLotsFiltersProps) => {
  const connectedAccount = useAccounts()?.starknetAccount?.address

  const buildingTypeSelect = (
    <Select
      value={filters.buildingType?.toString() ?? '0'}
      onValueChange={(value) =>
        onFiltersChange({
          buildingType: value === '0' ? null : parseInt(value),
        })
      }
    >
      <SelectTrigger className='w-36'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='0'>All</SelectItem>
        {pipe(
          Building.IDS,
          D.values,
          A.filter((type) => type !== 0),
          A.map((type) => (
            <SelectItem key={type} value={type.toString()}>
              {Building.getType(type).name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )

  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div>
        <Label>Asteroid</Label>
        <AsteroidSelect
          asteroidId={filters.asteroidId}
          onAsteroidChange={(asteroid) =>
            onFiltersChange({ asteroidId: asteroid?.id })
          }
          allowAll
        />
      </div>
      <div>
        <Label>Building Type</Label>
        {buildingTypeSelect}
      </div>
      <div>
        <Label>Owner Address</Label>
        <Input
          value={filters.owner ?? ''}
          onChange={(e) => onFiltersChange({ owner: e.target.value })}
        />
      </div>
      {connectedAccount && (
        <Button
          onClick={() =>
            onFiltersChange({
              owner: connectedAccount,
            })
          }
        >
          My Lots
        </Button>
      )}
      <div className='flex flex-col gap-y-1'>
        <Label>Deduplicate Owners</Label>
        <div className='flex h-10 items-center gap-x-3'>
          <Switch
            checked={filters.deduplicateOwners ?? false}
            onCheckedChange={(v) => onFiltersChange({ deduplicateOwners: v })}
          />
          <InfoTooltip>
            Enable this to only see one lot per owner in the list.
          </InfoTooltip>
        </div>
      </div>
      <Button
        variant='destructive'
        onClick={() =>
          onFiltersChange({
            asteroidId: 1,
            owner: null,
            deduplicateOwners: null,
            buildingType: null,
          })
        }
      >
        Reset
      </Button>
    </div>
  )
}
