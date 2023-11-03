'use client'

import { disconnect as disconnectMainnet } from '@wagmi/core'
import Image from 'next/image'
import { useConnect } from 'wagmi'
import { useConnectors } from '@starknet-react/core'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { AccountHeaderView } from './account-header-view'
import { AccountDetails } from './account-details'
import { getMainnetConnectorIcon, useAccounts } from '@/hooks/wallet-hooks'

export const WalletInfo = () => {
  const { mainnetAccount, starknetAccount } = useAccounts()

  const {
    connect: connectMainnet,
    isLoading: mainnetLoading,
    connectors: mainnetConnectors,
  } = useConnect()

  const {
    connect: connectStarknet,
    isLoading: starknetLoading,
    connectors: starknetConnectors,
    disconnect: disconnectStarknet,
  } = useConnectors()

  console.log({
    mainnetAccount,
    starknetAccount,
  })

  const isConnecting = mainnetLoading || starknetLoading
  console.log({ isConnecting })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button loading={isConnecting}>
          {mainnetAccount || starknetAccount ? (
            <AccountHeaderView
              mainnetAccount={mainnetAccount}
              starknetAccount={starknetAccount}
            />
          ) : (
            'Connect Wallet'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>My Account</DialogTitle>
        </DialogHeader>
        <Separator className='bg-primary' />
        <div className='flex flex-col gap-y-4'>
          <AccountDetails
            account={mainnetAccount}
            chainName='Mainnet'
            chainIcon='/ethereum-logo.svg'
            onDisconnect={disconnectMainnet}
            connectButtons={mainnetConnectors.map((connector) => {
              const icon = getMainnetConnectorIcon(connector.id)
              return (
                <Button
                  key={connector.id}
                  disabled={isConnecting}
                  onClick={() => connectMainnet({ connector })}
                  icon={
                    icon && (
                      <Image
                        src={icon}
                        width={20}
                        height={20}
                        alt={`${connector.name} logo`}
                      />
                    )
                  }
                >
                  {connector.name}
                </Button>
              )
            })}
          />
          <Separator className='bg-primary' />
          <AccountDetails
            account={starknetAccount}
            chainName='StarkNet'
            chainIcon='/starknet-logo.webp'
            onDisconnect={disconnectStarknet}
            connectButtons={starknetConnectors
              .filter((connector) => connector.available())
              .map((connector) => (
                <Button
                  key={connector.id}
                  disabled={isConnecting}
                  onClick={() => connectStarknet(connector)}
                  icon={
                    <Image
                      src={connector.icon}
                      width={20}
                      height={20}
                      alt={`${connector.name} logo`}
                    />
                  }
                >
                  {connector.name}
                </Button>
              ))}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
