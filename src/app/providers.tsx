'use client'

import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { mainnet as starknetMainnet } from '@starknet-react/chains'
import {
  StarknetConfig,
  publicProvider,
  braavos,
  argent,
} from '@starknet-react/core'
import { PropsWithChildren } from 'react'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'

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
  return (
    <StarknetConfig
      connectors={starknetConnectors}
      provider={starknetProvider}
      chains={[starknetMainnet]}
      autoConnect
    >
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
    </StarknetConfig>
  )
}
