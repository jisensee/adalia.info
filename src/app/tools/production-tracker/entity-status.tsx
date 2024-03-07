'use client'

import {
  BuildingType,
  Entity,
  Lot,
  ProcessType,
  ProductType,
} from '@influenceth/sdk'
import { FC, useEffect, useMemo, useState } from 'react'
import { Check, Cog, Hammer, Hourglass, Pickaxe } from 'lucide-react'
import Link from 'next/link'
import { addSeconds, formatRelative } from 'date-fns'
import { Format } from '@/lib/format'
import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'

type BaseEntityStatus = {
  remainingSeconds: number
  asteroidId: number
  name?: string
  lotUuid: string
}

export type ProcessStatus = {
  type: 'process'
  runningProcess: ProcessType
  outputProduct: ProductType
  processorType: number
  recipes: number
} & BaseEntityStatus

export type ExtractorStatus = {
  type: 'extractor'
  outputProduct: ProductType
  yield: number
} & BaseEntityStatus

export type BuildingConstructionStatus = {
  type: 'building'
  buildingType: BuildingType
} & BaseEntityStatus

export type IdleBuildingStatus = {
  type: 'idleBuilding'
  buildingType: BuildingType
} & Omit<BaseEntityStatus, 'remainingSeconds'>

export type EntityStatus =
  | ProcessStatus
  | ExtractorStatus
  | BuildingConstructionStatus
  | IdleBuildingStatus

type EntityStatusCardProps = {
  status: EntityStatus
}
const refreshInterval = 10

export const EntityStatusCard: FC<EntityStatusCardProps> = ({ status }) => {
  const idleBuilding = status.type === 'idleBuilding'
  const remainingSeconds =
    status.type !== 'idleBuilding' ? status.remainingSeconds : undefined

  const finishTime = useMemo(
    () =>
      remainingSeconds
        ? formatRelative(addSeconds(new Date(), remainingSeconds), new Date())
        : undefined,
    [remainingSeconds]
  )

  const [seconds, setSeconds] = useState(remainingSeconds)
  const isFinished = seconds ? seconds <= 0 : false

  const lotId = Lot.toIndex(Entity.unpackEntity(status.lotUuid).id)

  useEffect(() => {
    if (!seconds) return

    const interval = setInterval(() => {
      setSeconds((seconds) => (seconds ?? 0) - refreshInterval)
    }, refreshInterval * 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex items-center gap-x-3 rounded border border-primary px-3 py-1'>
      {getIcon(status)}
      <div className='flex w-full flex-col md:flex-row md:justify-between'>
        <div>
          <div>{getContent(status, isFinished)}</div>
          <LotDisplay
            className='hidden md:flex'
            lotId={lotId}
            lotUuid={status.lotUuid}
          />
        </div>
        <div className='flex items-center justify-between gap-x-3 text-primary md:justify-end'>
          <LotDisplay
            className='md:hidden'
            lotId={lotId}
            lotUuid={status.lotUuid}
          />
          {idleBuilding && <span className='text-2xl'>Idle</span>}
          {isFinished && !idleBuilding && (
            <div className='flex items-center gap-x-2'>
              <Check />
              <span className='text-xl'>Finished</span>
            </div>
          )}
          {!isFinished && !idleBuilding && (
            <div className='flex flex-col items-end'>
              <div className='flex items-center gap-x-2'>
                <Hourglass />
                <span className='whitespace-nowrap text-2xl'>
                  {Format.remainingTime(seconds ?? 0)}
                </span>
              </div>
              {finishTime && <span className='text-sm'>{finishTime}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type LotDisplayProps = {
  lotId: number
  lotUuid: string
  className?: string
}

const LotDisplay: FC<LotDisplayProps> = ({ lotId, lotUuid, className }) => (
  <div className={cn('flex gap-x-3', className)}>
    <Link
      className='text-primary hover:underline'
      href={`https://game-prerelease.influenceth.io/${lotUuid}`}
      target='_blank'
    >
      Lot #{lotId.toLocaleString('en')}
    </Link>
    <CopyButton value={lotId.toString()} copiedMessage='Copied LotID' />
  </div>
)

const getContent = (status: EntityStatus, isFinished: boolean) => {
  switch (status.type) {
    case 'process': {
      const building = Format.processor(status.processorType)
      const outputAmount =
        (status.runningProcess.outputs[status.outputProduct.i] ?? 1) *
        status.recipes
      const formattedOutput = Format.productAmount(
        status.outputProduct,
        outputAmount
      )
      return (
        <div>
          <h3>{status.runningProcess.name}</h3>
          <p>
            <span className='font-bold'>{status.name ?? building}</span>{' '}
            {isFinished ? 'produced' : 'is producing'}{' '}
            <span className='font-bold text-primary'>{formattedOutput}</span>
          </p>
        </div>
      )
    }
    case 'extractor': {
      const formattedOutput = Format.productAmount(
        status.outputProduct,
        status.yield
      )
      const actionText = isFinished ? 'Extracted' : 'Extracting'
      return (
        <div>
          <h3>{status.outputProduct.name} extraction</h3>
          <p>
            {status.name && <span className='font-bold'>{status.name}</span>}
            {status.name ? ' is ' + actionText.toLowerCase() : actionText}{' '}
            <span className='font-bold text-primary'> {formattedOutput}</span>
          </p>
        </div>
      )
    }
    case 'building':
      return (
        <div>
          <h3>{status.buildingType.name} construction</h3>
        </div>
      )
    case 'idleBuilding':
      return (
        <div>
          <h3>{status.buildingType.name}</h3>
        </div>
      )
    default:
      return <div />
  }
}

const getIcon = (status: EntityStatus) => {
  switch (status.type) {
    case 'process':
      return <Cog className='text-primary' size={35} />
    case 'extractor':
      return <Pickaxe className='text-primary' size={35} />
    case 'building':
      return <Hammer className='text-primary' size={35} />
    case 'idleBuilding':
      return <Hourglass className='text-primary' size={35} />
  }
}
