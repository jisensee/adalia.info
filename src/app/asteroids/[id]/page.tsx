import { notFound } from 'next/navigation'
import { FC, ReactNode } from 'react'
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
  const asteroid = await db.asteroid.findUnique({ where: { id } })
  if (!asteroid) {
    notFound()
  }
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
