'use client'

import { BarChart3, Orbit, Wrench } from 'lucide-react'
import Link from 'next/link'
import { WalletInfo } from './wallet/wallet-info'
import { Logo } from './logo'
import { Search } from './search'
import { cn } from '@/lib/utils'

const link =
  'text-primary p-3 text-lg hover:bg-primary hover:text-primary-foreground fill-primary stroke-primary hover:fill-primary-foreground hover:stroke-primary-foreground'

export const Navbar = () => {
  return (
    <>
      <nav className='sticky top-0 z-50 flex h-nav flex-row items-center justify-between border-b border-primary bg-background pr-3'>
        <div className='flex flex-row items-center'>
          <Link
            href='/'
            className={cn(link, 'flex items-center gap-x-2 !text-xl font-bold')}
          >
            <Logo.AdaliaInfo className='h-8 w-8 ' />
            adalia.info
          </Link>
          <Search
            className={cn(link, 'hidden cursor-pointer gap-x-2 sm:flex')}
          />
          <Link
            href='/asteroids'
            className={cn(link, 'hidden gap-x-2 sm:flex')}
          >
            <Orbit />
            <span>Asteroids</span>
          </Link>
          <Link href='/stats' className={cn(link, 'hidden gap-x-2 sm:flex')}>
            <BarChart3 />
            <span>Stats</span>
          </Link>
          <Link href='/tools' className={cn(link, 'hidden gap-x-2 sm:flex')}>
            <Wrench />
            <span>Tools</span>
          </Link>
        </div>
        <WalletInfo />
      </nav>
    </>
  )
}

export const BottomNavbar = () => (
  <nav className='flex flex-row items-center border-t border-primary bg-background sm:hidden'>
    <Search
      className={cn(link, 'flex grow cursor-pointer flex-col items-center')}
    />
    <Link
      href='/asteroids'
      className={cn(link, 'flex grow flex-col items-center')}
    >
      <Orbit />
      <span>Asteroids</span>
    </Link>
    <Link href='/stats' className={cn(link, 'flex grow flex-col items-center')}>
      <BarChart3 />
      <span>Stats</span>
    </Link>
    <Link href='/tools' className={cn(link, 'flex grow flex-col items-center')}>
      <Wrench />
      <span>Tools</span>
    </Link>
  </nav>
)
