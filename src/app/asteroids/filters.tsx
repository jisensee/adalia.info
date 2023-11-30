'use client'

import { Filter, FilterX } from 'lucide-react'
import { FC, PropsWithChildren } from 'react'
import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSpectralType,
} from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AsteroidFilters,
  emptyAsteroidFilters,
  useAsteroidFilters,
} from '@/components/asteroid-filters/filter-params'
import { useAccounts } from '@/hooks/wallet-hooks'

type FilteritemProps = {
  filters: Partial<AsteroidFilters>
  destructive?: boolean
} & PropsWithChildren

const FilterItem: FC<FilteritemProps> = ({
  filters,
  destructive,
  children,
}) => {
  const [, setFilters] = useAsteroidFilters()

  return (
    <DropdownMenuItem
      className='flex flex-row items-center gap-x-2'
      onClick={() => setFilters({ ...emptyAsteroidFilters, ...filters })}
    >
      {destructive ? (
        <FilterX width={20} height={20} />
      ) : (
        <Filter width={20} height={20} />
      )}
      <span>{children}</span>
    </DropdownMenuItem>
  )
}

export const Filters = () => {
  const { mainnetAccount, starknetAccount } = useAccounts()
  const addresses = [mainnetAccount?.address, starknetAccount?.address].flatMap(
    (a) => (a ? [a] : [])
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className='w-full'
          variant='outline'
          icon={<Filter />}
          responsive
        >
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <FilterItem filters={{}} destructive>
          Reset all
        </FilterItem>
        <DropdownMenuSeparator />
        <FilterItem filters={{ owned: true }}>Owned</FilterItem>
        {addresses.length > 0 && (
          <FilterItem filters={{ owners: addresses }}>Owned by me</FilterItem>
        )}
        <FilterItem
          filters={{
            scanStatus: [
              AsteroidScanStatus.ORBITAL_SCAN,
              AsteroidScanStatus.LONG_RANGE_SCAN,
            ],
          }}
        >
          Scanned
        </FilterItem>
        <FilterItem filters={{ scanStatus: [AsteroidScanStatus.UNSCANNED] }}>
          Unscanned
        </FilterItem>
        <FilterItem filters={{ rarity: [AsteroidRarity.INCOMPARABLE] }}>
          Incomparable
        </FilterItem>
        <FilterItem
          filters={{
            spectralType: [
              AsteroidSpectralType.C,
              AsteroidSpectralType.I,
              AsteroidSpectralType.M,
              AsteroidSpectralType.S,
            ],
          }}
        >
          Single-Type
        </FilterItem>
        <FilterItem
          filters={{
            spectralType: [
              AsteroidSpectralType.CI,
              AsteroidSpectralType.CM,
              AsteroidSpectralType.SM,
              AsteroidSpectralType.CIS,
              AsteroidSpectralType.CMS,
              AsteroidSpectralType.CS,
              AsteroidSpectralType.SI,
            ],
          }}
        >
          Multi-Type
        </FilterItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}