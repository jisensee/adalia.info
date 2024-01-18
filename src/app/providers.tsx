'use client'
import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { mainnet as starknetMainnet } from '@starknet-react/chains'
import {
  StarknetConfig,
  publicProvider,
  braavos,
  argent,
} from '@starknet-react/core'
import { PropsWithChildren, useState } from 'react'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import {
  PageParamCache,
  PageParamCacheProvider,
} from '@/context/page-param-cache'

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '',
    }),
  ]
)
const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [new MetaMaskConnector({ chains: [mainnet] })],
})
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
      <WagmiConfig config={wagmiConfig}>
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
      </WagmiConfig>
    </StarknetConfig>
  )
}
