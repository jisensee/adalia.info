import { Ship } from '@influenceth/sdk'
import { Filters } from './params'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccounts } from '@/hooks/wallet-hooks'
import { Button } from '@/components/ui/button'

export type ShipsForSaleFiltersProps = {
  filters: Filters
  onFiltersChange: (filters: Partial<Filters>) => void
}

export const ShipsForSaleFilters = ({
  filters,
  onFiltersChange,
}: ShipsForSaleFiltersProps) => {
  const connectedAccount = useAccounts()?.starknetAccount?.address

  const asteroidSelect = (
    <div>
      <Label>Asteroid ID</Label>
      <Input
        className='w-40'
        type='number'
        min={1}
        value={filters.asteroidId?.toString() ?? ''}
        onChange={(e) =>
          onFiltersChange({
            asteroidId: parseInt(e.target.value),
          })
        }
      />
    </div>
  )

  const sellerInput = (
    <div>
      <Label>Seller Address</Label>
      <Input
        className='w-64'
        value={filters.seller ?? ''}
        onChange={(e) =>
          onFiltersChange({
            seller: e.target.value,
          })
        }
      />
    </div>
  )

  const shipTypeSelect = (
    <div>
      <Label>Ship Type</Label>
      <Select
        value={filters.shipType?.toString() ?? '0'}
        onValueChange={(value) =>
          onFiltersChange({ shipType: value === '0' ? null : parseInt(value) })
        }
      >
        <SelectTrigger className='w-48'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[
            0,
            Ship.IDS.SHUTTLE,
            Ship.IDS.LIGHT_TRANSPORT,
            Ship.IDS.HEAVY_TRANSPORT,
          ].map((type) => (
            <SelectItem key={type} value={type.toString()}>
              {type === 0 ? 'All' : Ship.getType(type).name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const shipVariantSelect = (
    <div>
      <Label>Ship Variant</Label>
      <Select
        value={filters.shipVariant?.toString() ?? '0'}
        onValueChange={(value) =>
          onFiltersChange({
            shipVariant: value === '0' ? null : parseInt(value),
          })
        }
      >
        <SelectTrigger className='w-48'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[0, ...Object.values(Ship.VARIANTS)].map((type) => (
            <SelectItem key={type} value={type.toString()}>
              {type === 0 ? 'All' : Ship.getVariant(type).name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const clearButton = (
    <Button
      variant='destructive'
      onClick={() =>
        onFiltersChange({
          seller: null,
          asteroidId: null,
          shipType: null,
          shipVariant: null,
        })
      }
    >
      Clear Filters
    </Button>
  )

  return (
    <div className='flex flex-wrap items-end gap-3'>
      {asteroidSelect}
      {shipTypeSelect}
      {shipVariantSelect}
      {sellerInput}
      {connectedAccount && (
        <Button
          onClick={() =>
            onFiltersChange({
              seller: connectedAccount,
            })
          }
        >
          My Ships
        </Button>
      )}
      {clearButton}
    </div>
  )
}
