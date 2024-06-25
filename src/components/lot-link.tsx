import Link from 'next/link'
import { FC } from 'react'
import { Entity, Lot } from '@influenceth/sdk'
import { CopyButton } from './copy-button'
import { cn } from '@/lib/utils'

export type LotLinkProps = {
  uuid: string
  className?: string
}

export const LotLink: FC<LotLinkProps> = ({ uuid, className }) => {
  const lotId = Lot.toIndex(Entity.unpackEntity(uuid).id)

  return (
    <div className={cn('flex gap-x-3', className)}>
      <Link
        className='text-primary hover:underline'
        href={`https://game.influenceth.io/${uuid}`}
        target='_blank'
      >
        Lot #{lotId.toLocaleString('en')}
      </Link>
      <CopyButton value={lotId.toString()} copiedMessage='Copied LotID' />
    </div>
  )
}
