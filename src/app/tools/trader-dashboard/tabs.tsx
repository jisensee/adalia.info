'use client'

import { useSelectedLayoutSegment } from 'next/navigation'
import Link from 'next/link'
import { useQueryStates } from 'nuqs'
import { traderDashboardParams } from './params'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const DashboardTabs = () => {
  const segment = useSelectedLayoutSegment()
  const [{ walletAddress }] = useQueryStates(traderDashboardParams)

  const paramStr = walletAddress
    ? (`?walletAddress=${walletAddress}` as const)
    : ''

  return (
    <Tabs value={segment ?? 'open-orders'}>
      <TabsList className='h-10'>
        {walletAddress && (
          <>
            <Link href={`/tools/trader-dashboard/open-orders${paramStr}`}>
              <TabsTrigger value='open-orders' className='text-md'>
                Open Orders
              </TabsTrigger>
            </Link>
            <Link href={`/tools/trader-dashboard/inventory${paramStr}`}>
              <TabsTrigger value='inventory' className='text-md'>
                Inventory
              </TabsTrigger>
            </Link>
          </>
        )}
        <Link href={`/tools/trader-dashboard/belt-production${paramStr}`}>
          <TabsTrigger value='belt-production' className='text-md'>
            Belt Production
          </TabsTrigger>
        </Link>
      </TabsList>
    </Tabs>
  )
}
