'use client'

import NextImage from 'next/image'
import { formatRelative } from 'date-fns'
import { FC, useMemo } from 'react'
import { Entity } from '@influenceth/sdk'
import { CrewStatusData, crewmateImageUrl } from './api'
import { Format } from '@/lib/format'
import { useRemainingSeconds } from '@/hooks/timers'
import { LotLink } from '@/components/lot-link'
import { CopyButton } from '@/components/copy-button'

type CrewStatusProps = {
  crew: CrewStatusData
}
export const CrewStatus: FC<CrewStatusProps> = ({ crew }) => {
  const remainingSeconds = useRemainingSeconds(crew.readyAt)
  const isBusy = remainingSeconds > 0

  const locationStatus = useMemo(() => {
    if (crew.actionLocation && isBusy) {
      return { entity: crew.actionLocation, type: 'action' } as const
    }
    if (crew.habitat && !isBusy) {
      return { entity: crew.habitat, type: 'habitat' } as const
    }
    if (crew.habitat && !crew.actionLocation && isBusy) {
      return { entity: crew.habitat, type: 'travel' } as const
    }
  }, [crew, isBusy])

  const lotUuid = useMemo(
    () =>
      locationStatus?.entity?.Location?.locations?.find(
        (l) => l.label === Entity.IDS.LOT
      )?.uuid,
    [locationStatus]
  )

  return (
    <div className='flex gap-x-3 rounded border border-primary'>
      <NextImage
        src={crewmateImageUrl(crew.roster[0] ?? 0)}
        alt={crew.name + ' captain'}
        width={75}
        height={100}
      />
      <div className='flex w-full flex-col py-1 pr-4'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex flex-wrap items-center gap-x-3'>
            <h3>{crew.name}</h3>
            <div className='items-centre flex flex-row gap-x-2'>
              <span>#{crew.id}</span>
              <CopyButton
                value={crew.id.toString()}
                copiedMessage='Crew ID copied'
              />
            </div>
          </div>
          {isBusy && (
            <div className='flex flex-col items-end gap-x-3 sm:flex-row-reverse sm:items-center sm:justify-end'>
              <span className='font-bold uppercase text-primary'>Busy</span>
              <span>{Format.remainingTime(remainingSeconds)}</span>{' '}
            </div>
          )}
          {!isBusy && <p className='font-bold uppercase text-primary'>Idle</p>}
        </div>
        {isBusy && <p> Ready {formatRelative(crew.readyAt, new Date())}</p>}
        {locationStatus?.type === 'action' && (
          <p>
            {locationStatus.entity.label === Entity.IDS.BUILDING
              ? 'Working at'
              : 'In Flight on'}{' '}
            {locationStatus.entity?.Name?.name ??
              locationStatus.entity?.Building?.buildingType.name}
          </p>
        )}
        {locationStatus?.type === 'habitat' && (
          <p>Resting at {locationStatus.entity.Name?.name ?? 'Habitat'}</p>
        )}
        {locationStatus?.type === 'travel' && (
          <p>
            Travelling back to {locationStatus.entity.Name?.name ?? 'Habitat'}
          </p>
        )}
        {lotUuid && <LotLink uuid={lotUuid} />}
      </div>
    </div>
  )
}
