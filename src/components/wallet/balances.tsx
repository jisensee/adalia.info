import { Orbit } from 'lucide-react'
import Image from 'next/image'
import { Logo } from '../logo'

export type BalanceProps = {
  balance: number
}

export const AsteroidBalance = ({ balance }: BalanceProps) => (
  <div className='flex flex-row items-center gap-x-2'>
    <Orbit size={20} />
    {balance}
  </div>
)

export const EthBalance = ({ balance }: BalanceProps) => (
  <div className='flex flex-row gap-x-1'>
    <Logo.Ethereum size={20} />
    {balance.toLocaleString(undefined, {
      maximumFractionDigits: 3,
    })}
  </div>
)

export const SwayBalance = ({ balance }: BalanceProps) => (
  <div className='flex flex-row gap-x-1'>
    <Image src='/sway-logo.png' width={20} height={20} alt='sway logo' />
    {balance.toLocaleString()}
  </div>
)
