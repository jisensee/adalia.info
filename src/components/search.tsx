'use client'

import { Orbit, Search as SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Route } from 'next'
import { AsteroidScanStatus } from '@prisma/client'
import { LoadingIndicator } from './loading-indicator'
import { Address } from './address'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  AsteroidOwnerResult,
  AsteroidRarityResult,
  AsteroidResult,
  AsteroidStatusResult,
  SearchResult,
  search,
} from '@/actions/search'
import { Format } from '@/lib/format'

export type SearchProps = {
  className?: string
}

export const Search = ({ className }: SearchProps) => {
  const [open, setOpen] = useOpen()
  const [searchTerm, setSearchTerm] = useState('')
  const {
    results,
    loading: resultsLoading,
    usedSearchTerm,
  } = useSearchResult(searchTerm)

  const { push } = useRouter()

  const navigateToResult: typeof push = (newPath: Route) => {
    push(newPath)
    setOpen(false)
    setSearchTerm('')
  }

  const asteroidResults = results.filter(
    (res) => res.type === 'asteroid'
  ) as AsteroidResult[]

  const rarityResults = results.filter(
    (res) => res.type === 'asteroid-rarity'
  ) as AsteroidRarityResult[]

  const ownerResult = results.filter(
    (res) => res.type === 'asteroid-owner'
  )[0] as AsteroidOwnerResult | undefined
  const statusResults = results.filter(
    (res) => res.type === 'asteroid-status'
  ) as AsteroidStatusResult[]

  const helpItem = (title: string, example: string) => (
    <div className='rounded-md border border-primary px-4 py-2'>
      <p className='font-bold'>{title}</p>
      <p className='italic'>{example}</p>
    </div>
  )

  const searchHelp = (
    <>
      <p className='text-center text-lg font-bold text-primary'>
        Try searching for:
      </p>
      <div className='flex flex-wrap justify-center gap-3 p-3'>
        {helpItem('Asteroid ID', '1234, 69420, ...')}
        {helpItem('Asteroid name', 'Adalia Prime, ...')}
        {helpItem('Asteroid rarity', 'e.g. Superior, Incomparable, ...')}
        {helpItem('Owner', 'e.g. 0x1337...')}
        {helpItem('Asteroid status', 'owned, unowned, scanned, unscanned')}
      </div>
      <div className='text-center'>
        <span className='font-bold text-primary'>Tip: </span>
        <span className='italic'>You can also open this search with </span>
        <span className='whitespace-nowrap rounded-md bg-muted px-2 py-1 text-sm font-bold text-muted-foreground'>
          Ctrl + K
        </span>
      </div>
    </>
  )

  const asteroidsGroup = asteroidResults.length > 0 && (
    <CommandGroup heading='Asteroids'>
      <CommandItem
        key='show-all-asteroids'
        className='flex flex-row items-center gap-x-3 text-primary'
        onSelect={() => navigateToResult(`/asteroids?name=${usedSearchTerm}`)}
      >
        <Orbit />
        <span>Show all</span>
      </CommandItem>
      {asteroidResults.map((res) => (
        <CommandItem
          key={res.id}
          className='flex flex-row items-center gap-x-3'
          onSelect={() => navigateToResult(`/asteroids/${res.id}`)}
        >
          <Orbit />
          <span>
            {res.id}
            {res.name ? ` - ${res.name}` : ''}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const rarityGroup = rarityResults.length > 0 && (
    <CommandGroup heading='Asteroid Rarity'>
      {rarityResults.map((res) => (
        <CommandItem
          key={res.rarity}
          className={Format.asteroidRarityClassName(res.rarity)}
          onSelect={() => navigateToResult(`/asteroids?rarity=${res.rarity}`)}
        >
          {Format.asteroidRarity(res.rarity)}
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const statusGroup = statusResults.length > 0 && (
    <CommandGroup heading='Asteroid Status'>
      {statusResults.map((res) => (
        <CommandItem
          key={res.status}
          onSelect={() => {
            switch (res.status) {
              case 'owned':
                navigateToResult(`/asteroids?owned=true`)
                break
              case 'unowned':
                navigateToResult(`/asteroids?owned=false`)
                break
              case 'scanned':
                navigateToResult(
                  `/asteroids?scanStatus=${AsteroidScanStatus.LONG_RANGE_SCAN},${AsteroidScanStatus.ORBITAL_SCAN}`
                )
                break
              case 'unscanned':
                navigateToResult(
                  `/asteroids?scanStatus=${AsteroidScanStatus.UNSCANNED}`
                )
                break
            }
          }}
        >
          <span>
            Show all <span className='text-primary'>{res.status}</span>
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  )

  const ownerGroup = ownerResult && (
    <CommandGroup heading='Asteroid Owner'>
      <CommandItem
        onSelect={() => navigateToResult(`/owners/${ownerResult.address}`)}
      >
        <Address
          address={ownerResult.address}
          shownCharacters={6}
          hideCopyButton
        />
      </CommandItem>
      <CommandItem
        className='flex flex-row items-center gap-x-3 text-primary'
        onSelect={() =>
          navigateToResult(`/asteroids?owners=${ownerResult.address}`)
        }
      >
        <Orbit />
        <span>Show {ownerResult.ownedAsteroids} owned asteroids</span>
      </CommandItem>
    </CommandGroup>
  )

  return (
    <>
      <div className={className} onClick={() => setOpen(true)}>
        <SearchIcon className='cursor-pointer' />
        <span className='hidden sm:inline'>Search</span>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            setSearchTerm('')
          }
          setOpen(newOpen)
        }}
      >
        <CommandInput
          placeholder='Search for asteroid ID, name, owner, ...'
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        {results.length === 0 &&
          usedSearchTerm.length > 0 &&
          !resultsLoading && (
            <>
              <p className='py-4 text-center font-bold'>No results found</p>
              {searchHelp}
            </>
          )}
        {resultsLoading && (
          <div className='flex justify-center gap-x-3 py-3'>
            <LoadingIndicator />
            <span className='italic'>Loading results...</span>
          </div>
        )}
        {usedSearchTerm.length === 0 && searchHelp}
        <CommandList>
          {asteroidsGroup}
          {ownerGroup}
          {rarityGroup}
          {statusGroup}
        </CommandList>
      </CommandDialog>
    </>
  )
}

type UseSearchResultReturn = {
  results: SearchResult[]
  loading: boolean
  usedSearchTerm: string
}
const useSearchResult = (searchTerm: string) => {
  const [state, setState] = useState<UseSearchResultReturn>({
    results: [],
    loading: false,
    usedSearchTerm: '',
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setState((s) => ({ ...s, loading: true }))
      search(searchTerm).then((r) =>
        setState({ results: r, loading: false, usedSearchTerm: searchTerm })
      )
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchTerm])

  return state
}

const useOpen = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return [open, setOpen] as const
}
