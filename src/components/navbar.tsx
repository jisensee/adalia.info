import { Orbit } from 'lucide-react'
import Link from 'next/link'
import { WalletInfo } from './wallet/wallet-info'
import { Logo } from './logo'
import { cn } from '@/lib/utils'

export const Navbar = () => {
  const link =
    'text-primary p-3 text-lg flex gap-x-2 items-center hover:bg-primary hover:text-primary-foreground fill-primary stroke-primary hover:fill-primary-foreground hover:stroke-primary-foreground'

  return (
    <nav className='sticky top-0 z-50 flex flex-row items-center justify-between border-b border-primary bg-background pr-3'>
      <div className='flex flex-row items-center'>
        <Link href='/' className={cn('!text-xl font-bold', link)}>
          <Logo className='h-8 w-8 ' />
          adalia.info
        </Link>
        <Link href='/asteroids' className={link}>
          <Orbit />
          <span className='hidden sm:inline'>Asteroids</span>
        </Link>
      </div>
      <WalletInfo />
    </nav>
  )
}
