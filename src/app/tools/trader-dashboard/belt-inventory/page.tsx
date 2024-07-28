import { Product } from '@influenceth/sdk'
import { beltProductionParamsCache } from '../params'
import { BeltProductionFilters } from '../belt-production/filters'
import { getBeltInventory } from './api'
import { BeltInventoryTable } from './table'
import { influenceApi } from '@/lib/influence-api/api'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export default async function BeltProduction({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const { asteroidId } = beltProductionParamsCache.parse(searchParams)
  const [products, asteroidNames, floorPrices] = await Promise.all([
    getBeltInventory(asteroidId ?? undefined),
    influenceApi.util.asteroidNames(asteroidId ? [asteroidId] : []),
    influenceApi.util.floorPrices(Object.values(Product.IDS), {
      asteroidId: asteroidId ?? undefined,
    }),
  ])
  const asteroidName = asteroidId ? asteroidNames.get(asteroidId) : undefined
  const data = products.map((p) => ({
    ...p,
    floorPrice: floorPrices.get(p.product),
  }))
  return (
    <div className='space-y-3'>
      <Accordion type='single' className='mb-2' collapsible>
        <AccordionItem value='filters'>
          <AccordionTrigger>Filters</AccordionTrigger>
          <AccordionContent>
            <BeltProductionFilters />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {asteroidName && <h2>{asteroidName}</h2>}
      <BeltInventoryTable products={data} />
    </div>
  )
}
