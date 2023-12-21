'use client'

import { disconnect as disconnectMainnet } from '@wagmi/core'
import Image from 'next/image'
import { useConnect } from 'wagmi'
import {
  useConnect as useConnectStarknet,
  useDisconnect,
} from '@starknet-react/core'
import { User } from 'lucide-react'
import React from 'react'
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
  const { disconnect: starknetDisconnect } = useDisconnect()

  const [open, setOpen] = React.useState(false)

  const {
    connect: connectMainnet,
    isLoading: mainnetLoading,
    connectors: mainnetConnectors,
  } = useConnect()

  const { connect: connectStarknet, connectors: starknetConnectors } =
    useConnectStarknet()

  const isConnecting = mainnetLoading
  const accountsConnected = !!(mainnetAccount || starknetAccount)

  return (
    <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          loading={isConnecting}
          icon={accountsConnected ? undefined : <User />}
          responsive
        >
          {accountsConnected ? (
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
          <DialogTitle>My Accounts</DialogTitle>
        </DialogHeader>
        <Separator className='bg-primary' />
        <div className='flex flex-col gap-y-4'>
          <AccountDetails
            account={mainnetAccount}
            chainName='Mainnet'
            chainIcon='/ethereum-logo.svg'
            onDisconnect={disconnectMainnet}
            onNavigateAway={() => setOpen(false)}
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
            onDisconnect={starknetDisconnect}
            onNavigateAway={() => setOpen(false)}
            connectButtons={starknetConnectors
              .filter((connector) => connector.available())
              .map((connector) => (
                <Button
                  key={connector.id}
                  disabled={isConnecting}
                  onClick={() => connectStarknet({ connector })}
                  icon={
                    <Image
                      src={connector.icon.dark ?? ''}
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
