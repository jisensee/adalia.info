'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet as starknetMainnet } from '@starknet-react/chains'
import {
  StarknetConfig,
  publicProvider,
  braavos,
  argent,
} from '@starknet-react/core'
import { PropsWithChildren, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './wagmi-config'
import {
  PageParamCache,
  PageParamCacheProvider,
} from '@/context/page-param-cache'

const queryClient = new QueryClient()

const starknetProvider = publicProvider()
const starknetConnectors = [braavos(), argent()]

export const Providers = ({ children }: PropsWithChildren) => {
  const [pageParamCache, setPageParamCache] = useState<PageParamCache>({
    asteroidFilters: null,
    asteroidColumnConfig: null,
  })

  return (
    <StarknetConfig
      connectors={starknetConnectors}
      provider={starknetProvider}
      chains={[starknetMainnet]}
      autoConnect
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <PageParamCacheProvider
            value={{
              cache: pageParamCache,
              updateCache: (update) =>
                setPageParamCache((prev) => ({
                  ...prev,
                  ...update,
                })),
            }}
          >
            {children}
          </PageParamCacheProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StarknetConfig>
  )
}
