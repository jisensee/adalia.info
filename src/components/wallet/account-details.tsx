import { FC, ReactNode } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Address } from '../address'
import { AsteroidBalance, EthBalance, SwayBalance } from './balances'
import { AccountInfo } from '@/hooks/wallet-hooks'

export type AccountDetailsProps = {
  account?: AccountInfo
  chainName: string
  chainIcon: string
  connectButtons: ReactNode[]
  onDisconnect: () => void
  onNavigateAway: () => void
}

export const AccountDetails: FC<AccountDetailsProps> = ({
  account,
  chainName,
  chainIcon,
  connectButtons,
  onDisconnect,
  onNavigateAway,
}) => {
  const header = (
    <div className='flex flex-row items-center gap-x-2'>
      <Image
        className='mr-2 inline-block'
        src={chainIcon}
        width={25}
        height={25}
        alt={`${chainName} logo`}
      />
      <span className='grow text-2xl text-primary'>{chainName}</span>
      {account && (
        <Button size='sm' variant='destructive' onClick={onDisconnect}>
          Disconnect
        </Button>
      )}
    </div>
  )

  const details = account && (
    <div className='flex flex-col gap-y-2'>
      <Address
        address={account.address}
        shownCharacters={6}
        hideChainIcon
        onClick={onNavigateAway}
      />
      <div className='flex flex-row flex-wrap items-center gap-x-5'>
        {account.ownedAsteroids !== undefined && (
          <AsteroidBalance balance={account?.ownedAsteroids} />
        )}
        {account.ethBalance !== undefined && (
          <EthBalance balance={account.ethBalance} />
        )}
        {account.swayBalance !== undefined && (
          <SwayBalance balance={account.swayBalance} />
        )}
      </div>
    </div>
  )

  return (
    <div className='flex flex-col gap-y-2'>
      {header}
      {details}
      {!account && (
        <div className='flex flex-col gap-y-1'>
          <p className='italic'>
            Connect a wallet to see your account details{' '}
          </p>
          {connectButtons}
        </div>
      )}
    </div>
  )
}
