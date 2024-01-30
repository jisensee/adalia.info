import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { formatRelative } from 'date-fns'
import type { Metadata } from 'next'
import { Jura } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { BottomNavbar, Navbar } from '../components/navbar'
import { Providers } from './providers'
import { cn } from '@/lib/utils'
import { db } from '@/server/db'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/logo'
import { Search } from '@/components/search'
import { LoadingIndicator } from '@/components/loading-indicator'

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
      <div className='flex w-11/12 flex-col items-center gap-y-3 pb-3 pt-2 md:w-1/2'>
        <Separator className='bg-primary' />
        <div className='flex flex-row gap-x-7'>
          <Link href='https://discord.gg/XynYK5yCQy' target='_blank'>
            <SiDiscord className='hover:text-primary' size={30} />
          </Link>
          <Link href='https://github.com/jisensee/adalia.info' target='_blank'>
            <SiGithub className='hover:text-primary' size={30} />
          </Link>
          <Link href='https://influenceth.io' target='_blank'>
            <Logo.Influence size={35} />
          </Link>
        </div>
        {lastAsteroidUpdate && (
          <div className='text-center'>
            <span className='text-primary'>Last data update: </span>
            <span>
              {formatRelative(
                lastAsteroidUpdate,
                new Date(new Date().toUTCString())
              )}
            </span>
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
        <Suspense fallback={<LoadingIndicator />}>
          <Providers>
            <div className='flex h-full flex-col'>
              <Search listenToKeyboard hideButton />
              <Navbar />
              <div className='flex h-full flex-row overflow-y-hidden'>
                <div id='sidebar' />
                <div className='flex h-full w-full flex-col gap-y-3 overflow-y-auto'>
                  {children}
                  {footer}
                </div>
              </div>
              <BottomNavbar />
            </div>
          </Providers>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
