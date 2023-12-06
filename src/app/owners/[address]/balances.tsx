'use client'

import { FC } from 'react'
import { useBalances } from '@/hooks/wallet-hooks'
import {
  AsteroidBalance,
  EthBalance,
  SwayBalance,
} from '@/components/wallet/balances'

export type BalancesProps = {
  address: string
}
export const Balances: FC<BalancesProps> = ({ address }) => {
  const { ethBalance, swayBalance, ownedAsteroids } = useBalances(address)

  return (
    <div className='flex flex-row flex-wrap items-center gap-x-3'>
      {ownedAsteroids !== undefined && (
        <AsteroidBalance balance={ownedAsteroids} />
      )}
      {ethBalance !== undefined && <EthBalance balance={ethBalance} />}
      {swayBalance !== undefined && <SwayBalance balance={swayBalance} />}
    </div>
  )
}
