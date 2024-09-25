'use client'

import { Filter, FilterX } from 'lucide-react'
import { FC, PropsWithChildren } from 'react'
import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSpectralType,
} from '@prisma/client'
import { Building } from '@influenceth/sdk'
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
} from '@/components/asteroid-filters/filter-params'
import { useAccounts } from '@/hooks/wallet-hooks'
import { useAsteroidFilters } from '@/components/asteroid-filters/hooks'
import { cn } from '@/lib/utils'

type FilteritemProps = {
  filters: Partial<AsteroidFilters>
  destructive?: boolean
  highlight?: boolean
} & PropsWithChildren

const FilterItem: FC<FilteritemProps> = ({
  filters,
  destructive,
  highlight,
  children,
}) => {
  const [, setFilters] = useAsteroidFilters()

  return (
    <DropdownMenuItem
      className={cn('flex flex-row items-center gap-x-2', {
        'text-destructive': destructive,
        'text-primary': highlight,
      })}
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

export const FiltersDropdown = () => {
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
        {addresses.length > 0 && (
          <FilterItem filters={{ owners: addresses }} highlight>
            Owned by me
          </FilterItem>
        )}
        <FilterItem filters={{ owned: true }}>Owned</FilterItem>
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
        <FilterItem
          filters={{
            hasBuildings: true,
          }}
        >
          Inhabited
        </FilterItem>
        <FilterItem
          filters={{
            buildings: [Building.IDS.MARKETPLACE],
          }}
        >
          With Marketplace
        </FilterItem>
        <FilterItem
          filters={{
            buildings: [Building.IDS.SPACEPORT],
          }}
        >
          With Spaceport
        </FilterItem>
        <FilterItem
          filters={{
            buildings: [Building.IDS.HABITAT],
          }}
        >
          With Habitat
        </FilterItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
