'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { decodeQueryParams } from 'serialize-query-params'
import { XIcon } from 'lucide-react'
import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import { Form, FormField } from '../ui/form'
import { Button } from '../ui/button'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { AsteroidFilterParams } from './filter-params'
import {
  EnumFilter,
  OwnedFilter,
  OwnerFilter,
  RangeFilter,
} from './asteroid-filters'
import {
  asteroidsPageParamConfig,
  buildAsteroidsUrl,
} from '@/app/asteroids/types'
import { cn } from '@/lib/utils'
import { Constants } from '@/lib/constants'
import { Format } from '@/lib/format'

export type AsteroidFilterFormProps = {
  searchParams: Record<string, string | string[]>
}

export const AsteroidFilterForm: FC<AsteroidFilterFormProps> = ({
  searchParams,
}) => {
  const params = useMemo(
    () => decodeQueryParams(asteroidsPageParamConfig, searchParams),
    [searchParams]
  )

  const [expanded, setExpanded] = useState(false)

  const form = useForm<Partial<AsteroidFilterParams>>({
    mode: 'onChange',
    values: params,
  })
  const { push } = useRouter()

  const onReset = () =>
    push(
      buildAsteroidsUrl({
        ...params,
        owner: null,
        owned: null,
        semiMajorAxis: null,
        orbitalPeriod: null,
        inclination: null,
        eccentricity: null,
        radius: null,
        rarity: null,
        surfaceArea: null,
        spectralType: null,
        scanStatus: null,
        size: null,
      })
    )

  useEffect(() => {
    form.reset(params)
  }, [params, form])

  const onSave = (values: Partial<AsteroidFilterParams>) =>
    push(buildAsteroidsUrl(values))

  const generalFilters = (
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
        name='owner'
        render={({ field }) => (
          <OwnerFilter value={field.value} onChange={field.onChange} />
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
              AsteroidScanStatus.RESOURCE_SCAN,
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
            unit={Constants.RADIUS_UNIT}
            value={field.value}
            onChange={field.onChange}
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
            unit={Constants.SURFACE_AREA_UNIT}
            value={field.value}
            onChange={field.onChange}
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
            unit='AU'
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
            unit={Constants.ORBITAL_PERIOD_UNIT}
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
            unit={Constants.INCLINATION_UNIT}
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
            name='Orbital Period'
            min={Constants.ECCENTRICITY_MIN}
            max={Constants.ECCENTRICITY_MAX}
            step={0.001}
            unit=''
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )

  const filters = (
    <Accordion type='multiple' defaultValue={['general']}>
      <AccordionItem value='general'>
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent>{generalFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='size'>
        <AccordionTrigger>Size</AccordionTrigger>
        <AccordionContent>{sizeFilters}</AccordionContent>
      </AccordionItem>
      <AccordionItem value='orbitals'>
        <AccordionTrigger>Orbitals</AccordionTrigger>
        <AccordionContent>{orbitalFilters}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  return (
    <div
      className={cn(
        'h-full shrink-0 rounded-r-xl border-2 border-primary transition-all duration-100 ease-in-out',
        {
          'w-full md:w-[30rem]': expanded,
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
                {filters}
              </div>
              <div className='grow' />
              <div className='flex flex-row gap-x-20 px-5 pb-5'>
                <Button
                  className='grow'
                  type='button'
                  variant='destructive'
                  onClick={() => onReset()}
                >
                  Reset
                </Button>
                <Button className='grow' type='submit'>
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
  )
}
