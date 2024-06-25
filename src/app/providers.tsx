'use client'

import { Provider as JotaiProvider } from 'jotai'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet as starknetMainnet } from '@starknet-react/chains'
import {
  StarknetConfig,
  braavos,
  argent,
  alchemyProvider,
} from '@starknet-react/core'
import { PropsWithChildren } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './wagmi-config'

const queryClient = new QueryClient()

const starknetProvider = alchemyProvider({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '',
})
const starknetConnectors = [braavos(), argent()]

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <StarknetConfig
      connectors={starknetConnectors}
      provider={starknetProvider}
      chains={[starknetMainnet]}
      autoConnect
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <JotaiProvider>{children}</JotaiProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StarknetConfig>
  )
}
