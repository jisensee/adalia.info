'use client'

import { MetaMaskConnector } from '@wagmi/core/connectors/metaMask'
import { StarknetConfig, InjectedConnector } from '@starknet-react/core'
import { PropsWithChildren } from 'react'
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
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
