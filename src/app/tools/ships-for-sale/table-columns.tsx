import { ColumnDef } from '@tanstack/react-table'
import { Product, Ship } from '@influenceth/sdk'
import { Box, Fuel, X } from 'lucide-react'
import { A, pipe } from '@mobily/ts-belt'
import { ProductAmount } from '../trader-dashboard/product-amount'
import { type ShipForSale } from './api'
import { SwayAmount } from '@/components/sway-amount'
import { Address } from '@/components/address'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const getShipStatus = (ship: ShipForSale) => {
  if (ship.asteroid && ship.spaceport) return 'Docked'
  if (ship.asteroid && ship.lotUuid) return 'Landed'
  if (ship.asteroid && !ship.spaceport) return 'In Orbit'
  return 'In Flight'
}

export const columns: ColumnDef<ShipForSale>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => row.name,
    enableSorting: true,
  },
  {
    id: 'type',
    header: 'Type',
    accessorFn: (row) => Ship.getType(row.type).name,
    enableSorting: true,
  },
  {
    id: 'propellant',
    header: 'Propellant',
    accessorFn: (row) => row.propellantPercentage,
    enableSorting: true,
    cell: ({ row }) => {
      const percentage = Math.round(row.original.propellantPercentage)
      return (
        <div
          className={cn('flex items-center gap-x-2', {
            'text-success': percentage > 75,
            'text-warning': percentage > 25 && percentage <= 75,
            'text-destructive': percentage <= 25,
          })}
        >
          <Fuel size={20} />
          {percentage}%
        </div>
      )
    },
  },
  {
    id: 'cargo',
    header: 'Cargo',
    accessorFn: (row) => row.cargo.length > 0,
    enableSorting: true,
    cell: ({ row }) => <CargoCell ship={row.original} />,
  },
  {
    id: 'variant',
    header: 'Variant',
    accessorFn: (row) => Ship.getVariant(row.variant).name,
    enableSorting: true,
    cell: ({ row }) => (
      <span
        className={
          row.original.variant !== Ship.VARIANTS.STANDARD ? 'text-primary' : ''
        }
      >
        {Ship.getVariant(row.original.variant).name}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    accessorFn: getShipStatus,
    enableSorting: true,
    cell: ({ row }) => {
      const status = getShipStatus(row.original)
      return (
        <span className={status === 'In Flight' ? 'text-warning' : ''}>
          {status}
        </span>
      )
    },
  },
  {
    id: 'seller',
    header: 'Seller',
    accessorFn: (row) => row.seller,
    enableSorting: false,
    cell: ({ row }) => (
      <Address address={row.original.seller} shownCharacters={4} />
    ),
  },
  {
    id: 'asteroid',
    header: 'Asteroid',
    accessorFn: (row) => row.asteroid?.name,
    enableSorting: true,
  },
  {
    id: 'spaceport',
    header: 'Spaceport',
    accessorFn: (row) => row.spaceport?.name,
    enableSorting: true,
  },
  {
    id: 'price',
    header: 'Price',
    accessorFn: (row) => row.price,
    enableSorting: true,
    cell: ({ row }) => <SwayAmount sway={row.original.price} allDigits />,
  },
]

const CargoCell = ({ ship }: { ship: ShipForSale }) => {
  const hasCargo = ship.cargo.length > 0
  return (
    <div
      className={cn('flex items-center gap-x-2', {
        'text-success': hasCargo,
        'text-destructive': !hasCargo,
      })}
    >
      {!hasCargo && (
        <div className='flex items-center gap-x-1'>
          <X className='inline' />
          <span>No</span>
        </div>
      )}
      {hasCargo && (
        <Dialog>
          <DialogTrigger className='flex items-center gap-x-1'>
            <Box className='inline' /> <span>Yes</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ship.name} - Cargo</DialogTitle>
            </DialogHeader>
            <div className='flex flex-col gap-y-2'>
              {pipe(
                ship.cargo,
                A.sortBy(({ product }) => Product.getType(product).name),
                A.map(({ product, amount }) => (
                  <ProductAmount
                    key={product}
                    product={Product.getType(product)}
                    amount={amount}
                    hideBadges
                  />
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
