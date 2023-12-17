'use client'

import { Blockchain } from '@prisma/client'
import { FC } from 'react'
import { useEnsName } from 'wagmi'
import { useStarkName } from '@starknet-react/core'
import Link from 'next/link'
import { Logo } from './logo'
import { CopyButton } from './copy-button'
import { Format } from '@/lib/format'
import { cn } from '@/lib/utils'

type AddressProps = {
  address: string
  shownCharacters: number
  hideChainIcon?: boolean
  hideCopyButton?: boolean
  heading?: boolean
}

export const Address: FC<AddressProps> = ({
  address,
  shownCharacters,
  hideChainIcon,
  hideCopyButton,
  heading,
}) => {
  const chain = address.length > 42 ? Blockchain.STARKNET : Blockchain.ETHEREUM

  const { data: ensName } = useEnsName({ address: address as `0x${string}` })
  const { data: starkName } = useStarkName({ address })

  const name = ensName ?? starkName

  return (
    <div className='flex flex-row items-center gap-x-3'>
      {!hideChainIcon && <Logo.Blockchain blockchain={chain} size={25} />}
      <Link
        className={cn('text-primary hover:text-secondary', {
          'text-3xl': heading,
        })}
        href={`/owners/${address}`}
      >
        {name ? name : Format.ethAddress(address, shownCharacters)}
      </Link>
      {!hideCopyButton && (
        <CopyButton
          value={address}
          copiedMessage='Address copied to clipboard!'
          large={heading}
        />
      )}
    </div>
  )
}
