import Link from 'next/link'
import { FC } from 'react'
import { Entity, Lot } from '@influenceth/sdk'
import { CopyButton } from './copy-button'
import { cn } from '@/lib/utils'
import { Format } from '@/lib/format'

export type LotLinkProps = {
  uuid: string
  className?: string
}

export const LotLink: FC<LotLinkProps> = ({ uuid, className }) => {
  const lotId = Entity.unpackEntity(uuid).id
  const lotIndex = Lot.toIndex(lotId)

  return (
    <div className={cn('flex gap-x-3', className)}>
      <Link
        className='text-primary hover:underline'
        href={`https://game.influenceth.io/lot/${lotId}`}
        target='_blank'
      >
        Lot {Format.lotIndex(lotIndex)}
      </Link>
      <CopyButton value={lotIndex.toString()} copiedMessage='Copied LotID' />
    </div>
  )
}
