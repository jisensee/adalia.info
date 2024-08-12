import { ColumnDef } from '@tanstack/react-table'
import { O } from '@mobily/ts-belt'
import { differenceInSeconds, isFuture } from 'date-fns'
import { Cog, Hammer, Rocket } from 'lucide-react'
import { Permission } from '@influenceth/sdk'
import { ReactNode } from 'react'
import { type PublicBuilding } from './api'
import { SwayAmount } from '@/components/sway-amount'
import { Format } from '@/lib/format'
import { LotLink } from '@/components/lot-link'
import { cn } from '@/lib/utils'

const getPermissionIcon = (permission: number) => {
  switch (permission) {
    case Permission.IDS.RUN_PROCESS:
      return <Cog size={16} />
    case Permission.IDS.EXTRACT_RESOURCES:
      return <Hammer size={16} />
    default:
      return <Rocket size={16} />
  }
}

const renderFinishTime = (permission: number, date?: Date) => (
  <div
    className={cn(
      'flex items-center gap-x-1',
      date && isFuture(date) ? 'text-warning' : 'text-success'
    )}
  >
    {getPermissionIcon(permission)}{' '}
    {date && isFuture(date)
      ? Format.remainingTime(differenceInSeconds(date, new Date()))
      : 'Now'}
  </div>
)

const renderPolicies = (
  policies: PublicBuilding['prepaidPolicies'],
  render: (policy: PublicBuilding['prepaidPolicies'][number]) => ReactNode
) => (
  <div className='flex items-center gap-x-3'>
    {policies.map((policy) => (
      <div className='flex items-center gap-x-1' key={policy.permission}>
        {getPermissionIcon(policy.permission)}
        {render(policy)}
      </div>
    ))}
  </div>
)

export const columns: ColumnDef<PublicBuilding>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => row.name,
    enableSorting: true,
  },
  {
    id: 'free-at',
    header: 'Free At',
    accessorFn: ({ finishTimes }) =>
      finishTimes.type === 'shipyard'
        ? (finishTimes.processFinishTime?.getTime() ?? 0) +
          (finishTimes.assembleShipFinishTime?.getTime() ?? 0)
        : finishTimes.processFinishTime,
    enableSorting: true,
    cell: ({
      row: {
        original: { finishTimes, isPublic, prepaidPolicies },
      },
    }) =>
      finishTimes.type === 'shipyard' ? (
        <div className='flex items-center gap-x-3'>
          {(isPublic ||
            prepaidPolicies.some(
              (p) => p.permission === Permission.IDS.RUN_PROCESS
            )) &&
            renderFinishTime(
              Permission.IDS.RUN_PROCESS,
              finishTimes.processFinishTime
            )}
          {(isPublic ||
            prepaidPolicies.some(
              (p) => p.permission === Permission.IDS.ASSEMBLE_SHIP
            )) &&
            renderFinishTime(
              Permission.IDS.ASSEMBLE_SHIP,
              finishTimes.assembleShipFinishTime
            )}
        </div>
      ) : (
        renderFinishTime(finishTimes.permission, finishTimes.processFinishTime)
      ),
  },
  {
    id: 'location',
    header: 'Location',
    accessorFn: (row) => row.lotUuid,
    cell: ({ row }) => <LotLink uuid={row.original.lotUuid} />,
    enableSorting: false,
  },
  {
    id: 'distance',
    header: 'Distance',
    accessorFn: (row) => row.habitatDistance,
    cell: ({ row }) => O.map(row.original.habitatDistance, Format.distance),
    enableSorting: true,
  },
  {
    id: 'minimum-duration',
    header: 'Minimum Duration',
    accessorFn: (row) =>
      row.prepaidPolicies.reduce((acc, policy) => acc + policy.minimumDays, 0),
    cell: ({ row }) =>
      renderPolicies(row.original.prepaidPolicies, (policy) =>
        Format.days(policy.minimumDays)
      ),
    enableSorting: true,
  },
  {
    id: 'notice-period',
    header: 'Notice Period',
    accessorFn: (row) =>
      row.prepaidPolicies.reduce((acc, policy) => acc + policy.daysNotice, 0),
    cell: ({ row }) =>
      renderPolicies(row.original.prepaidPolicies, (policy) =>
        Format.days(policy.daysNotice)
      ),
    enableSorting: true,
  },
  {
    id: 'rate',
    header: 'Price / Day',
    accessorFn: (building) =>
      building.isPublic
        ? 0
        : building.prepaidPolicies.reduce(
            (acc, policy) => acc + policy.swayPerDay,
            0
          ),
    cell: ({ row }) =>
      renderPolicies(row.original.prepaidPolicies, (policy) => {
        if (policy.swayPerDay === 0) return 'Public'
        return <SwayAmount sway={policy.swayPerDay * 1e6} allDigits />
      }),
    enableSorting: true,
  },
]
