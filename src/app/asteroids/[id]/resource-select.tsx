import { Product } from '@influenceth/sdk'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ProductIcon } from '@/components/influence-asset-icons'

export type ResourceSelectProps = {
  selectedResource: number
  onSelectedResourceChange: (resource: number) => void
  resources: number[]
}

export const ResourceSelect = ({
  selectedResource,
  onSelectedResourceChange,
  resources,
}: ResourceSelectProps) => (
  <div>
    <Label>Resource</Label>
    <Select
      value={selectedResource.toString()}
      onValueChange={(r) => onSelectedResourceChange(parseInt(r))}
    >
      <SelectTrigger className='w-64'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={'0'}>All</SelectItem>
        {resources.map((resource) => (
          <SelectItem key={resource} value={resource.toString()}>
            <div className='flex items-center gap-x-2'>
              <ProductIcon product={resource} size={24} />
              {Product.getType(resource).name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)
