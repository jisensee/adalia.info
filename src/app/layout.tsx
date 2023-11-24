import './globals.css'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { formatRelative } from 'date-fns'
import type { Metadata } from 'next'
import { Jura } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '../components/navbar'
import { Providers } from './providers'
import { cn } from '@/lib/utils'
import { db } from '@/server/db'
import { Separator } from '@/components/ui/separator'

const font = Jura({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'adalia.info',
  manifest: '/manifest.json',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const lastAsteroidUpdate = (
    await db.asteroidImportRun.findFirst({
      where: { end: { not: null } },
      orderBy: { end: 'desc' },
    })
  )?.end

  const footer = (
    <div className='flex flex-row justify-center'>
      <div className='flex w-1/2 flex-col items-center gap-y-3 pb-3 pt-2'>
        <Separator className='bg-primary' />
        <div className='flex flex-row gap-x-7'>
          <Link href='https://discord.gg/XynYK5yCQy' target='_blank'>
            <SiDiscord className='hover:text-primary' size={30} />
          </Link>
          <Link href='https://github.com/jisensee/adalia.info' target='_blank'>
            <SiGithub className='hover:text-primary' size={30} />
          </Link>
          <Link href='https://influenceth.io' target='_blank'>
            <Image
              src='/influence-logo.svg'
              width={30}
              height={30}
              alt='Influence logo'
            />
          </Link>
        </div>
        {lastAsteroidUpdate && (
          <div>
            <span className='mr-1 text-primary'>Last data update:</span>
            {formatRelative(lastAsteroidUpdate, new Date())}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <html lang='en' className='h-full'>
      <body
        className={cn(font.className, 'h-full bg-background text-foreground')}
      >
        <Providers>
          <div className='flex h-full flex-col'>
            <Navbar />
            {children}
            {footer}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
