import { FC, ReactNode } from 'react'
import Image from 'next/image'
import { Button } from '../ui/button'
import { AsteroidBalance, EthBalance, SwayBalance } from './balances'
import { AccountInfo } from '@/hooks/wallet-hooks'
import { Format } from '@/lib/format'

export type AccountDetailsProps = {
  account?: AccountInfo
  chainName: string
  chainIcon: string
  connectButtons: ReactNode[]
  onDisconnect: () => void
}

export const AccountDetails: FC<AccountDetailsProps> = ({
  account,
  chainName,
  chainIcon,
  connectButtons,
  onDisconnect,
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
      <p className='italic text-primary' title={account.address}>
        {Format.ethAddress(account.address, 6)}
      </p>
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
