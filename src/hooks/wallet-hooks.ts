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

const SWAY_MAINNED_ADDRESS = '0x9DE7f7a6c0B00902983c6f0658E157A8a684Cfd5'

export type AccountInfo = {
  address: string
  ethBalance: number
  swayBalance: number
  ownedAsteroids: number
  walletIcon: string
}

export const useAccounts = () => {
  const mainnetAccount = useMainnetAccountInfo(useMainnetAccount())
  const starknetAccount = useStarknetAccountInfo(useStarknetAccount())

  return { mainnetAccount, starknetAccount }
}

export const getMainnetConnectorIcon = (id: string) => {
  switch (id) {
    case 'metaMask':
      return '/metamask-logo.svg'
  }
}

const useAsteroidCount = (address?: string) => {
  const [count, setCount] = useState<number>()

  useEffect(() => {
    if (address) {
      console.log('get count for', address)
      getAsteroidCount(address).then(setCount)
    }
  }, [address])

  return count
}

const getSwayBalance = (value: bigint, decimals: number) =>
  new Number(value / 10n ** BigInt(decimals)).valueOf()

const getEthBalance = (value: bigint) =>
  (new Number(value / 10n ** 9n).valueOf() / 10 ** 9).valueOf()

const useMainnetAccountInfo = ({
  address,
  connector,
}: ReturnType<typeof useMainnetAccount>): AccountInfo | undefined => {
  const ethBalanceResult = useMainnetBalance({
    address: address,
  })?.data

  const swayBalanceResult = useMainnetBalance({
    address: address,
    token: SWAY_MAINNED_ADDRESS,
  })?.data

  const ethBalance = ethBalanceResult
    ? getEthBalance(ethBalanceResult.value)
    : undefined

  const swayBalance = swayBalanceResult
    ? getSwayBalance(swayBalanceResult.value, swayBalanceResult.decimals)
    : undefined

  const ownedAsteroids = useAsteroidCount(address)
  const walletIcon = connector
    ? getMainnetConnectorIcon(connector.id)
    : undefined

  return address &&
    ethBalance !== undefined &&
    swayBalance !== undefined &&
    ownedAsteroids !== undefined &&
    walletIcon
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
  const ethBalanceResult = useStarknetBalance({
    address,
  })?.data
  const ethBalance = ethBalanceResult
    ? getEthBalance(ethBalanceResult.value)
    : undefined

  const correctedAddress = address ? '0x0' + address.slice(2) : undefined
  const ownedAsteroids = useAsteroidCount(correctedAddress)
  const walletIcon = connector?.icon

  return correctedAddress &&
    ethBalance !== undefined &&
    ownedAsteroids !== undefined &&
    walletIcon
    ? {
        ethBalance,
        swayBalance: 0,
        ownedAsteroids,
        address: correctedAddress,
        walletIcon,
      }
    : undefined
}
