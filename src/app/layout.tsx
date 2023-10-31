import './globals.css'
import type { Metadata } from 'next'
import { Jura } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from '../components/navbar'
import { Providers } from './providers'
import { cn } from '@/lib/utils'

const font = Jura({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'adalia.info',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='h-full'>
      <body
        className={cn(font.className, 'h-full bg-background text-foreground')}
      >
        <Providers>
          <div className='flex h-full flex-col'>
            <Navbar />
            {children}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
