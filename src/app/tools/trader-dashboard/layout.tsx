import { Metadata } from 'next'
import { ReactNode } from 'react'
import { DashboardTabs } from './tabs'
import { TraderDashboardForm } from './form'

export const metadata: Metadata = {
  title: 'Trader Dashboard | adalia.info',
}

export default async function TraderDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className='space-y-3 p-3'>
      <h1>Trader Dashboard</h1>
      <TraderDashboardForm />
      <DashboardTabs />
      {children}
    </div>
  )
}
