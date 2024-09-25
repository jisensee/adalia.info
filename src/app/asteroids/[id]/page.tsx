import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { Building, Entity } from '@influenceth/sdk'
import { Asteroid } from '@prisma/client'
import { Abundances } from './abundances'
import { db } from '@/server/db'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AsteroidImage } from '@/components/asteroid-image'
import {
  AsteroidCoorbitalsButton,
  AsteroidGameButton,
} from '@/components/asteroid-action-button'
import { Address } from '@/components/address'
import { influenceApi } from '@/lib/influence-api/api'
import { BuildingIcon } from '@/components/influence-asset-icons'

type Params = {
  params: {
    id: string
  }
}

export default async function AsteroidDetailPage({ params }: Params) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }
  const [asteroid, abundances] = await Promise.all([
    db.asteroid.findUnique({ where: { id } }),
    influenceApi
      .entity({ label: Entity.IDS.ASTEROID, id })
      .then((a) => a?.Celestial?.abundances),
  ])
  if (!asteroid) {
    notFound()
  }
  const buildingCounts = getBuildingCounts(asteroid)
  const stats = (
    <Accordion
      className='flex w-full flex-col gap-y-3 sm:max-w-sm'
      type='multiple'
      defaultValue={['general', 'size', 'orbitals']}
    >
      <AccordionItem
        value='general'
        className='rounded-lg border border-primary px-5 py-2'
      >
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-y-1'>
            {asteroid.ownerAddress && (
              <InfoRow
                title='Owner'
                value={
                  <Address
                    address={asteroid.ownerAddress}
                    shownCharacters={4}
                  />
                }
              />
            )}
            <InfoRow
              title='Spectral type'
              value={Format.asteroidSpectralType(asteroid.spectralType)}
            />
            <InfoRow
              title='Scan status'
              value={Format.asteroidScanStatus(asteroid.scanStatus)}
            />
            {asteroid.rarity && (
              <InfoRow
                title='Rarity'
                value={Format.asteroidRarity(asteroid.rarity)}
                valueClassName={Format.asteroidRarityClassName(asteroid.rarity)}
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value='size'
        className='rounded-lg border border-primary px-5 py-2'
      >
        <AccordionTrigger>Size</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-y-1'>
            <InfoRow title='Size' value={Format.asteroidSize(asteroid.size)} />
            <InfoRow
              title='Surface area'
              value={Format.surfaceArea(asteroid.surfaceArea)}
            />
            <InfoRow title='Radius' value={Format.radius(asteroid.radius)} />
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value='orbitals'
        className='rounded-lg border border-primary px-5 py-2'
      >
        <AccordionTrigger>Orbitals</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-y-1'>
            <InfoRow
              title='Orbital period'
              value={Format.orbitalPeriod(asteroid.orbitalPeriod)}
            />
            <InfoRow
              title='Semi major axis'
              value={Format.semiMajorAxis(asteroid.semiMajorAxis)}
            />
            <InfoRow
              title='Inclination'
              value={Format.inclination(asteroid.inclination)}
            />
            <InfoRow
              title='Eccentricity'
              value={Format.eccentricity(asteroid.eccentricity)}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  return (
    <div className='flex flex-col gap-y-3 p-3'>
      <h1>
        Asteroid{' '}
        {asteroid.name?.length ?? 0 > 0 ? `'${asteroid.name}'` : asteroid.id}
      </h1>
      <div className='flex flex-col items-center gap-5 sm:flex-row sm:items-start'>
        <div className='flex flex-col gap-y-3'>
          <AsteroidImage id={asteroid.id} width={350} />
          <AsteroidGameButton id={asteroid.id} />
          <AsteroidCoorbitalsButton semiMajorAxis={asteroid.semiMajorAxis} />
        </div>
        {stats}
      </div>
      {buildingCounts.length > 0 && (
        <div className='flex flex-col gap-y-3'>
          <h2>{asteroid.totalBuildings} Buildings</h2>
          <div className='flex flex-wrap gap-3'>
            {buildingCounts.map(({ buildingId, count }) => (
              <div
                key={buildingId}
                className='flex gap-x-1 rounded-md border border-primary px-2 py-1'
              >
                <BuildingIcon size={75} building={buildingId} />
                <div className='flex flex-col items-center'>
                  <p className='text-lg text-primary'>
                    {Building.getType(buildingId).name}
                  </p>
                  <p className='text-2xl font-bold'>{count.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Abundances
        asteroidId={asteroid.id}
        abundances={abundances ?? undefined}
        lotCount={Math.floor(asteroid.surfaceArea)}
      />
    </div>
  )
}

type InfoRowProps = {
  title: string
  value: ReactNode
  valueClassName?: string
}

const InfoRow: FC<InfoRowProps> = ({ title, value, valueClassName }) => (
  <div className='flex flex-row items-center justify-between'>
    <span className='text-xl text-primary'>{title}</span>
    <span className={cn('text-xl', valueClassName)}>{value}</span>
  </div>
)

const getBuildingCounts = (asteroid: Asteroid) =>
  [
    {
      buildingId: Building.IDS.WAREHOUSE,
      count: asteroid.warehouses,
    },
    {
      buildingId: Building.IDS.TANK_FARM,
      count: asteroid.tankFarms,
    },
    {
      buildingId: Building.IDS.EXTRACTOR,
      count: asteroid.extractors,
    },
    {
      buildingId: Building.IDS.REFINERY,
      count: asteroid.refineries,
    },
    {
      buildingId: Building.IDS.BIOREACTOR,
      count: asteroid.bioreactors,
    },
    {
      buildingId: Building.IDS.FACTORY,
      count: asteroid.factories,
    },
    {
      buildingId: Building.IDS.SHIPYARD,
      count: asteroid.shipyards,
    },
    {
      buildingId: Building.IDS.MARKETPLACE,
      count: asteroid.marketplaces,
    },
    {
      buildingId: Building.IDS.SPACEPORT,
      count: asteroid.spaceports,
    },
    {
      buildingId: Building.IDS.HABITAT,
      count: asteroid.habitats,
    },
  ].filter(({ count }) => count > 0)
