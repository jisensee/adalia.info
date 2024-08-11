import { ColumnDef } from '@tanstack/react-table'
import { O, pipe } from '@mobily/ts-belt'
import { differenceInSeconds, isFuture } from 'date-fns'
import { type PublicBuilding } from './api'
import { SwayAmount } from '@/components/sway-amount'
import { Format } from '@/lib/format'
import { LotLink } from '@/components/lot-link'

const getRate = (building: PublicBuilding) => {
  if (building.isPublic) return 0
  return building.prepaidPolicies[0]?.swayPerDay ?? 0
}

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
    accessorFn: (row) => row.freeAt,
    enableSorting: true,
    cell: ({ row }) =>
      pipe(
        row.original.freeAt,
        O.filter(isFuture),
        O.mapWithDefault(<span className='text-success'>Now</span>, (date) => (
          <span className='text-warning'>
            {Format.remainingTime(differenceInSeconds(date, new Date()))}
          </span>
        ))
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
    accessorFn: (row) => row.prepaidPolicies[0]?.minimumDays,
    cell: ({ row }) => {
      const [policy1, policy2] = row.original.prepaidPolicies
      if (policy1 && policy2 && policy1.minimumDays !== policy2.minimumDays) {
        return `${Format.days(policy1.minimumDays)} / ${Format.days(policy2.minimumDays)}`
      } else if (policy1) {
        return Format.days(policy1.minimumDays)
      }
      return undefined
    },
    enableSorting: true,
  },
  {
    id: 'notice-period',
    header: 'Notice Period',
    accessorFn: (row) => row.prepaidPolicies[0]?.daysNotice,
    cell: ({ row }) => {
      const [policy1, policy2] = row.original.prepaidPolicies
      if (policy1 && policy2 && policy1.daysNotice !== policy2.daysNotice) {
        return `${Format.days(policy1.daysNotice)} / ${Format.days(policy2.daysNotice)}`
      } else if (policy1) {
        return Format.days(policy1.daysNotice)
      }
      return undefined
    },
    enableSorting: true,
  },
  {
    id: 'rate',
    header: 'Price / Day',
    accessorFn: getRate,
    cell: ({ row }) => {
      if (row.original.isPublic) return 'Public'
      const [policy1, policy2] = row.original.prepaidPolicies
      const renderRate = (rate: number) => (
        <SwayAmount sway={rate * 1e6} allDigits />
      )
      if (policy1 && policy2 && policy1.swayPerDay !== policy2.swayPerDay) {
        return (
          <div className='flex items-center gap-x-1'>
            {renderRate(policy1.swayPerDay)} / {renderRate(policy2.swayPerDay)}
          </div>
        )
      } else if (policy1) {
        return renderRate(policy1.swayPerDay)
      }
      return undefined
    },
    enableSorting: true,
  },
]
