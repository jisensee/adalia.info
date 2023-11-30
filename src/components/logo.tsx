import { SVGProps } from 'react'
import Image from 'next/image'
import { Blockchain } from '@prisma/client'

export type LogoProps = {
  size: number
}
const StarkNet = ({ size }: LogoProps) => (
  <Image
    src='/starknet-logo.webp'
    width={size}
    height={size}
    alt='starknet logo'
  />
)
const Ethereum = ({ size }: LogoProps) => (
  <Image
    src='/ethereum-logo.svg'
    width={size}
    height={size}
    alt='ethereum logo'
  />
)
export const Logo = {
  StarkNet,
  Ethereum,
  Blockchain: ({ size, blockchain }: LogoProps & { blockchain: Blockchain }) =>
    blockchain === Blockchain.ETHEREUM ? (
      <Ethereum size={size} />
    ) : (
      <StarkNet size={size} />
    ),
  Influence: ({ size }: LogoProps) => (
    <Image
      src='/influence-logo.svg'
      width={size}
      height={size}
      alt='Influence logo'
    />
  ),
  AdaliaInfo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      version='1.1'
      viewBox='0 0 100 80'
      {...props}
    >
      <g strokeDasharray='none'>
        <circle cx='48.774' cy='39.504' r='10' strokeWidth='0.08'></circle>
        <circle cx='22.961' cy='74.398' r='7' strokeWidth='0.033'></circle>
        <circle cx='47.345' cy='14.963' r='7' strokeWidth='0.032'></circle>
        <ellipse
          cx='45.814'
          cy='40.812'
          fill='none'
          strokeOpacity='1'
          strokeWidth='2'
          rx='44.338'
          ry='39.482'
        ></ellipse>
        <ellipse
          cx='43.061'
          cy='38.476'
          fill='none'
          strokeOpacity='1'
          strokeWidth='2'
          rx='32.328'
          ry='24.487'
        ></ellipse>
      </g>
    </svg>
  ),
}
