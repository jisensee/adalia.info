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
      {ownedAsteroids && <AsteroidBalance balance={ownedAsteroids} />}
      {ethBalance && <EthBalance balance={ethBalance} />}
      {swayBalance && <SwayBalance balance={swayBalance} />}
    </div>
  )
}
