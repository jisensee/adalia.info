import {
  useBalance as useStarknetBalance,
  useAccount as useStarknetAccount,
} from '@starknet-react/core'
import { useEffect, useState } from 'react'
import {
  useBalance as useMainnetBalance,
  useAccount as useMainnetAccount,
} from 'wagmi'
import { getAsteroidCount } from '@/actions/asteroids'

const SWAY_MAINNET_ADDRESS = '0x9DE7f7a6c0B00902983c6f0658E157A8a684Cfd5'
const SWAY_STARKNET_ADDRESS =
  '0x004878d1148318a31829523ee9c6a5ee563af6cd87f90a30809e5b0d27db8a9b'

export type AccountInfo = {
  address: string
  ethBalance?: number
  swayBalance?: number
  ownedAsteroids?: number
  walletIcon: string
}

export const useAccounts = () => {
  const mainnetAccount = useMainnetAccountInfo(useMainnetAccount())
  const starknetAccount = useStarknetAccountInfo(useStarknetAccount())

  return { mainnetAccount, starknetAccount }
}

const useAsteroidCount = (address?: string) => {
  const [count, setCount] = useState<number>()

  useEffect(() => {
    if (address) {
      getAsteroidCount(address).then(setCount)
    }
  }, [address])

  return count
}
export const useBalances = (address?: string) => {
  const isStarknet = address && address.length > 42

  const ethBalanceResult = useMainnetBalance({
    address: isStarknet ? undefined : (address as `0x${string}`),
  })?.data

  const swayBalanceResult = useMainnetBalance({
    address: isStarknet ? undefined : (address as `0x${string}`),
    token: SWAY_MAINNET_ADDRESS,
  })?.data

  const mainnetEthBalance = ethBalanceResult
    ? getEthBalance(ethBalanceResult.value)
    : undefined

  const mainnetSwayBalance = swayBalanceResult
    ? getSwayBalance(swayBalanceResult.value, swayBalanceResult.decimals)
    : undefined

  const starkEthBalanceResult = useStarknetBalance({
    address: isStarknet ? address : undefined,
  })?.data

  const starkSwayBalanceResult = useStarknetBalance({
    address: isStarknet ? address : undefined,
    token: SWAY_STARKNET_ADDRESS,
  })?.data
  const starkSwayBalance = starkSwayBalanceResult
    ? getSwayBalance(
        starkSwayBalanceResult.value,
        starkSwayBalanceResult.decimals
      )
    : undefined

  const starkEthBalance = starkEthBalanceResult
    ? getEthBalance(starkEthBalanceResult.value)
    : undefined

  const ownedAsteroids = useAsteroidCount(address)

  return {
    ethBalance: mainnetEthBalance ?? starkEthBalance,
    swayBalance: mainnetSwayBalance ?? starkSwayBalance,
    ownedAsteroids,
  }
}

const getSwayBalance = (value: bigint, decimals: number) =>
  new Number(value / 10n ** BigInt(decimals)).valueOf()

const getEthBalance = (value: bigint) =>
  (new Number(value / 10n ** 9n).valueOf() / 10 ** 9).valueOf()

const useMainnetAccountInfo = ({
  address,
  connector,
}: ReturnType<typeof useMainnetAccount>): AccountInfo | undefined => {
  const { ownedAsteroids, ethBalance, swayBalance } = useBalances(address)

  const walletIcon = connector?.icon

  return address && walletIcon
    ? {
        ethBalance,
        swayBalance,
        ownedAsteroids,
        address: address.toLowerCase(),
        walletIcon,
      }
    : undefined
}

const useStarknetAccountInfo = ({
  address,
  connector,
}: ReturnType<typeof useStarknetAccount>): AccountInfo | undefined => {
  const { ownedAsteroids, ethBalance, swayBalance } = useBalances(address)

  const walletIcon = connector?.icon?.dark

  return address && walletIcon
    ? {
        ethBalance,
        swayBalance: swayBalance,
        ownedAsteroids,
        address,
        walletIcon,
      }
    : undefined
}
