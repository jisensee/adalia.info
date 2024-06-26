import { getAllProductions } from '../api'
import { beltProductionParamsCache } from '../params'
import { BeltProductionFilters } from './filters'
import { BeltProductionTable } from './table'
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
  const [productions, asteroidNames] = await Promise.all([
    getAllProductions(asteroidId ?? undefined),
    influenceApi.util.asteroidNames(asteroidId ? [asteroidId] : []),
  ])
  const asteroidName = asteroidId ? asteroidNames.get(asteroidId) : undefined
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
      <BeltProductionTable productions={productions} />
    </div>
  )
}
