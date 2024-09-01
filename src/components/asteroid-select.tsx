import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Button } from './ui/button'
import { LoadingIndicator } from './loading-indicator'
import { getAsteroidName, searchAsteroid } from '@/actions/asteroids'
import { useDebouncedState } from '@/hooks/debounce'

export type AsteroidSelectProps = {
  asteroidId?: number | null
  onAsteroidChange: (asteroid?: InfluenceEntity) => void
  disabled?: boolean
  allowAll?: boolean
}

export const AsteroidSelect = ({
  asteroidId,
  allowAll,
  disabled,
  onAsteroidChange,
}: AsteroidSelectProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedState(search, 300)
  const [selectedAsteroidName, setSelectedAsteroidName] = useState<string>()

  const { data: asteroids, isLoading: asteroidsLoading } = useQuery({
    queryKey: ['asteroid-search', debouncedSearch],
    queryFn: () => searchAsteroid(debouncedSearch),
  })

  const { data: asteroidName, isLoading: asteroidNameLoading } = useQuery({
    queryKey: ['asteroid-name', asteroidId],
    queryFn: () => (asteroidId ? getAsteroidName(asteroidId) : undefined),
    enabled: !!asteroidId && !selectedAsteroidName,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='flex w-72 justify-start'
        >
          {asteroidNameLoading
            ? ''
            : asteroidName ??
              selectedAsteroidName ??
              (allowAll ? 'All' : 'Select an asteroid')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-72 p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder='Search for an asteroid name or ID'
          />
          <CommandList>
            {asteroids?.length === 0 && !asteroidsLoading && (
              <CommandEmpty>No asteroids found</CommandEmpty>
            )}
            {asteroidsLoading ? (
              <div className='flex items-center justify-center p-3'>
                <LoadingIndicator className='h-24 w-24 text-primary' />
              </div>
            ) : (
              <CommandGroup>
                {!search && allowAll && (
                  <CommandItem
                    onSelect={() => {
                      setSelectedAsteroidName(undefined)
                      setSearch('')
                      setOpen(false)
                      onAsteroidChange()
                    }}
                  >
                    <span className='font-bold text-primary'>All</span>
                  </CommandItem>
                )}
                {asteroids?.map((asteroid) => (
                  <CommandItem
                    key={asteroid.id}
                    onSelect={() => {
                      setSearch('')
                      setSelectedAsteroidName(getEntityName(asteroid))
                      setOpen(false)
                      onAsteroidChange(asteroid)
                    }}
                  >
                    {getEntityName(asteroid)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
