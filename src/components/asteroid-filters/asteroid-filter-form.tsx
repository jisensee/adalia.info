'use client'

import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { XIcon } from 'lucide-react'
import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import { Building } from '@influenceth/sdk'
import { Form, FormField } from '../ui/form'
import { Button } from '../ui/button'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { Portal } from '../portal'
import { AsteroidFilters, emptyAsteroidFilters } from './filter-params'
import {
  BlockchainFilter,
  BooleanFilter,
  EnumFilter,
  OwnedFilter,
  OwnerFilter,
  RangeFilter,
  StarkSightTokenFilter,
  StringFilter,
} from './asteroid-filters'

import { useAsteroidFilters } from './hooks'
import { cn } from '@/lib/utils'
import { Constants } from '@/lib/constants'
import { Format } from '@/lib/format'

export const AsteroidFilterForm = () => {
  const [isLoading, startTransition] = useTransition()
  const [filters, setFilters] = useAsteroidFilters(startTransition)

  const [expanded, setExpanded] = useState(false)

  const form = useForm<Partial<AsteroidFilters>>({
    mode: 'onChange',
    values: filters,
  })

  const onReset = () => setFilters(emptyAsteroidFilters)

  useEffect(() => {
    form.reset(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), form])

  const onSave = (values: Partial<AsteroidFilters>) =>
    setFilters({ ...emptyAsteroidFilters, ...values })

  const generalFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='name'
        render={({ field }) => (
          <StringFilter
            name='Name'
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name='starksightToken'
        render={({ field }) => (
          <StarkSightTokenFilter
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name='spectralType'
        render={({ field }) => (
          <EnumFilter
            name='Spectral type'
            value={field.value}
            onChange={field.onChange}
            format={Format.asteroidSpectralType}
            options={[
              AsteroidSpectralType.C,
              AsteroidSpectralType.CI,
              AsteroidSpectralType.CIS,
              AsteroidSpectralType.CM,
              AsteroidSpectralType.CMS,
              AsteroidSpectralType.CS,
              AsteroidSpectralType.I,
              AsteroidSpectralType.M,
              AsteroidSpectralType.S,
              AsteroidSpectralType.SI,
              AsteroidSpectralType.SM,
            ]}
          />
        )}
      />
      <FormField
        control={form.control}
        name='rarity'
        render={({ field }) => (
          <EnumFilter
            name='Rarity'
            value={field.value}
            onChange={field.onChange}
            format={Format.asteroidRarity}
            options={[
              AsteroidRarity.COMMON,
              AsteroidRarity.UNCOMMON,
              AsteroidRarity.RARE,
              AsteroidRarity.SUPERIOR,
              AsteroidRarity.EXCEPTIONAL,
              AsteroidRarity.INCOMPARABLE,
            ]}
          />
        )}
      />
      <FormField
        control={form.control}
        name='scanStatus'
        render={({ field }) => (
          <EnumFilter
            name='Scan status'
            value={field.value}
            onChange={field.onChange}
            format={Format.asteroidScanStatus}
            options={[
              AsteroidScanStatus.UNSCANNED,
              AsteroidScanStatus.LONG_RANGE_SCAN,
              AsteroidScanStatus.ORBITAL_SCAN,
            ]}
          />
        )}
      />
    </div>
  )

  const ownershipFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='owned'
        render={({ field }) => (
          <OwnedFilter value={field.value} onChange={field.onChange} />
        )}
      />
      <FormField
        control={form.control}
        name='owners'
        render={({ field }) => (
          <OwnerFilter
            value={field.value?.filter(Boolean) ?? null}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )

  const saleFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='salePrice'
        render={({ field }) => (
          <RangeFilter
            name='Sale price'
            min={Constants.SALE_PRICE_MIN}
            max={Constants.SALE_PRICE_MAX}
            step={0.001}
            formatValue={Format.salePrice}
            value={field.value}
            onChange={field.onChange}
            logScale
          />
        )}
      />
      <FormField
        control={form.control}
        name='blockchain'
        render={({ field }) => (
          <BlockchainFilter value={field.value} onChange={field.onChange} />
        )}
      />
      <FormField
        control={form.control}
        name='earlyAdopter'
        render={({ field }) => (
          <BooleanFilter
            value={field.value}
            onChange={field.onChange}
            name='Early Adopter'
          />
        )}
      />
      <FormField
        control={form.control}
        name='scanBonus'
        render={({ field }) => (
          <EnumFilter
            name='Scan bonus'
            value={field.value}
            onChange={field.onChange}
            format={Format.asteroidScanBonus}
            options={['1', '2', '3', '4']}
          />
        )}
      />
      <FormField
        control={form.control}
        name='purchaseOrder'
        render={({ field }) => (
          <RangeFilter
            name='Purchase order'
            min={1}
            max={12_000}
            step={1}
            formatValue={Format.purchaseOrder}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )

  const sizeFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='radius'
        render={({ field }) => (
          <RangeFilter
            name='Radius'
            min={Constants.RADIUS_MIN}
            max={Constants.RADIUS_MAX}
            step={1}
            formatValue={Format.radius}
            value={field.value}
            onChange={field.onChange}
            logScale
          />
        )}
      />
      <FormField
        control={form.control}
        name='surfaceArea'
        render={({ field }) => (
          <RangeFilter
            name='Surface area'
            min={Constants.SURFACE_AREA_MIN}
            max={Constants.SURFACE_AREA_MAX}
            step={1}
            formatValue={Format.surfaceArea}
            value={field.value}
            onChange={field.onChange}
            logScale
          />
        )}
      />
      <FormField
        control={form.control}
        name='size'
        render={({ field }) => (
          <EnumFilter
            name='Size'
            value={field.value}
            onChange={field.onChange}
            format={Format.asteroidSize}
            options={[
              AsteroidSize.SMALL,
              AsteroidSize.MEDIUM,
              AsteroidSize.LARGE,
              AsteroidSize.HUGE,
            ]}
          />
        )}
      />
    </div>
  )

  const orbitalFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='semiMajorAxis'
        render={({ field }) => (
          <RangeFilter
            name='Semi major axis'
            min={Constants.SEMI_MAJOR_AXIS_MIN}
            max={Constants.SEMI_MAJOR_AXIS_MAX}
            step={0.001}
            formatValue={Format.semiMajorAxis}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name='orbitalPeriod'
        render={({ field }) => (
          <RangeFilter
            name='Orbital period'
            min={Constants.ORBITAL_PERIOD_MIN}
            max={Constants.ORBITAL_PERIOD_MAX}
            step={1}
            formatValue={Format.orbitalPeriod}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name='inclination'
        render={({ field }) => (
          <RangeFilter
            name='Inclination'
            min={Constants.INCLINATION_MIN}
            max={Constants.INCLINATION_MAX}
            step={0.01}
            formatValue={Format.inclination}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <FormField
        control={form.control}
        name='eccentricity'
        render={({ field }) => (
          <RangeFilter
            name='Eccentricity'
            min={Constants.ECCENTRICITY_MIN}
            max={Constants.ECCENTRICITY_MAX}
            step={0.001}
            formatValue={Format.eccentricity}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )

  const buildingFilters = (
    <div className='flex flex-col gap-y-5'>
      <FormField
        control={form.control}
        name='hasBuildings'
        render={({ field }) => (
          <BooleanFilter
            value={field.value}
            onChange={field.onChange}
            name='Has Buildings'
          />
        )}
      />
      <FormField
        control={form.control}
        name='buildings'
        render={({ field }) => (
          <EnumFilter
            name='Buildings'
            value={field.value}
            onChange={field.onChange}
            format={(v) => Building.getType(v).name}
            options={[
              Building.IDS.WAREHOUSE,
              Building.IDS.TANK_FARM,
              Building.IDS.EXTRACTOR,
              Building.IDS.REFINERY,
              Building.IDS.BIOREACTOR,
              Building.IDS.FACTORY,
              Building.IDS.SHIPYARD,
              Building.IDS.MARKETPLACE,
              Building.IDS.SPACEPORT,
              Building.IDS.HABITAT,
            ]}
          />
        )}
      />
    </div>
  )

  const filterAccordion = (
    <Accordion type='multiple' defaultValue={['general']}>
      <AccordionItem value='general'>
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent>{generalFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='ownership'>
        <AccordionTrigger>Ownership</AccordionTrigger>
        <AccordionContent>{ownershipFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='sales'>
        <AccordionTrigger>Sales</AccordionTrigger>
        <AccordionContent>{saleFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='size'>
        <AccordionTrigger>Size</AccordionTrigger>
        <AccordionContent>{sizeFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='orbitals'>
        <AccordionTrigger>Orbitals</AccordionTrigger>
        <AccordionContent>{orbitalFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='buildings'>
        <AccordionTrigger>Buildings</AccordionTrigger>
        <AccordionContent>{buildingFilters}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  return (
    <Portal selector='#sidebar'>
      <div
        className={cn(
          'h-full shrink-0 rounded-r-xl border-2 border-primary transition-all duration-100 ease-in-out',
          {
            'w-screen md:w-[30rem]': expanded,
            'w-12': !expanded,
          }
        )}
      >
        {expanded && (
          <div className='flex h-full flex-col gap-y-2 rounded-l-sm rounded-r-xl px-3 py-2'>
            <Form {...form}>
              <form
                className='grid h-full grid-rows-[auto,1fr,auto] gap-3'
                onSubmit={form.handleSubmit(onSave)}
              >
                <div className='flex flex-row items-center justify-between'>
                  <h1>Filters</h1>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setExpanded(false)}
                  >
                    <XIcon size='30px' />
                  </Button>
                </div>
                <div className='overflow-y-auto overflow-x-hidden pr-3'>
                  {filterAccordion}
                </div>
                <div className='grow' />
                <div className='flex flex-row gap-x-20 px-5 pb-5'>
                  <Button
                    className='grow'
                    type='button'
                    variant='destructive'
                    onClick={() => onReset()}
                    loading={isLoading}
                  >
                    Reset
                  </Button>
                  <Button className='grow' type='submit' loading={isLoading}>
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
        {!expanded && (
          <div
            className='flex h-full cursor-pointer items-center justify-center rounded-l-none rounded-r-xl border-0 text-primary hover:bg-primary hover:text-primary-foreground'
            onClick={() => setExpanded(true)}
          >
            <span
              className='rotate-180 transform text-xl'
              style={{ writingMode: 'vertical-lr' }}
            >
              Filters
            </span>
          </div>
        )}
      </div>
      ,
    </Portal>
  )
}
