'use client'

import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { StarknetConfig, InjectedConnector } from '@starknet-react/core'
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
const starknetConnectors = [
  new InjectedConnector({ options: { id: 'braavos' } }),
  new InjectedConnector({ options: { id: 'argentX' } }),
]

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <StarknetConfig connectors={starknetConnectors} autoConnect>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
    </StarknetConfig>
  )
}
