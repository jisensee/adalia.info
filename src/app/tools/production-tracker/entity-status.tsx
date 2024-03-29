'use client'

import { BuildingType, ProcessType, ProductType } from '@influenceth/sdk'
import { FC } from 'react'
import { Check, Hourglass } from 'lucide-react'
import { formatRelative } from 'date-fns'
import { Format } from '@/lib/format'
import { useRemainingSeconds } from '@/hooks/timers'
import { LotLink } from '@/components/lot-link'
import { BuildingIcon, ProductIcon } from '@/components/influence-asset-icons'

type BaseEntityStatus = {
  finishTime: Date
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

export const EntityStatusCard: FC<EntityStatusCardProps> = ({ status }) => {
  const idleBuilding = status.type === 'idleBuilding'
  const remainingSeconds = useRemainingSeconds(status.finishTime)

  const isFinished = remainingSeconds <= 0

  return (
    <div className='flex items-center gap-x-3 rounded border border-primary px-3 py-1'>
      {getIcon(status)}
      <div className='flex w-full flex-col md:flex-row md:justify-between'>
        <div>
          <div>{getContent(status, isFinished)}</div>
          <LotLink className='hidden md:flex' uuid={status.lotUuid} />
        </div>
        <div className='flex items-center justify-between gap-x-3 text-primary md:justify-end'>
          <LotLink className='md:hidden' uuid={status.lotUuid} />
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
                  {Format.remainingTime(remainingSeconds)}
                </span>
              </div>
              <span className='text-sm'>
                {formatRelative(status.finishTime, new Date())}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
      return <ProductIcon product={status.outputProduct} size={64} />
    case 'extractor':
      return <ProductIcon product={status.outputProduct} size={64} />
    case 'building':
      return (
        <BuildingIcon building={status.buildingType} size={64} isHologram />
      )
    case 'idleBuilding':
      return <BuildingIcon building={status.buildingType} size={64} />
  }
}
