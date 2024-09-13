import Image from 'next/image'
import { AsteroidBalance, EthBalance, SwayBalance } from './balances'
import { AccountInfo } from '@/hooks/wallet-hooks'

export type AccountHeaderViewProps = {
  mainnetAccount?: AccountInfo
  starknetAccount?: AccountInfo
}
export const AccountHeaderView = ({
  mainnetAccount,
  starknetAccount,
}: AccountHeaderViewProps) => {
  const ethBalance = combineBalances(
    mainnetAccount?.ethBalance,
    starknetAccount?.ethBalance
  )
  const swayBalance = combineBalances(
    mainnetAccount?.swayBalance,
    starknetAccount?.swayBalance
  )
  const ownedAsteroids = combineBalances(
    mainnetAccount?.ownedAsteroids,
    starknetAccount?.ownedAsteroids
  )

  return (
    <div className='flex flex-row items-center gap-x-4'>
      <div className='hidden flex-row items-center gap-x-4 lg:flex'>
        {ownedAsteroids && <AsteroidBalance balance={ownedAsteroids} />}
        {ethBalance && <EthBalance balance={ethBalance} />}
        {swayBalance && <SwayBalance balance={swayBalance} />}
      </div>
      <div className='flex flex-row items-center gap-x-2'>
        {mainnetAccount?.walletIcon && (
          <Image
            src={mainnetAccount.walletIcon}
            width={20}
            height={20}
            alt='mainnet wallet logo'
          />
        )}
        {starknetAccount?.walletIcon && (
          <Image
            src={starknetAccount.walletIcon}
            width={20}
            height={20}
            alt='starknet wallet logo'
          />
        )}
      </div>
    </div>
  )
}

const combineBalances = (mainnet?: number, starknet?: number) => {
  if (mainnet && starknet) {
    return mainnet + starknet
  }
  if (mainnet) {
    return mainnet
  }
  if (starknet) {
    return starknet
  }
  return undefined
}
