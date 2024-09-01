'use client'
import { match, P } from 'ts-pattern'
import { useQueryStates } from 'nuqs'
import { Fragment, ReactNode, useState } from 'react'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { A, F, flow, pipe } from '@mobily/ts-belt'
import { Trash } from 'lucide-react'
import { asteroidDistancesParams } from './params'
import { Label } from '@/components/ui/label'
import { AsteroidSelect } from '@/components/asteroid-select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export type AsteroidDistancesFormProps = {
  asteroidNames: Map<number, string>
}
export const AsteroidDistancesForm = ({
  asteroidNames,
}: AsteroidDistancesFormProps) => {
  const [params, setParams] = useQueryStates(asteroidDistancesParams, {
    shallow: false,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const initialSelectedDestinations = pipe(
    params.destinations ?? [],
    A.filterMap((id) => {
      const name = asteroidNames.get(id)
      return name ? F.toMutable([id, name] as const) : null
    })
  )
  const [selectedDestinations, setSelectedDestinations] = useState<
    [number, string][]
  >(initialSelectedDestinations)

  const addDestination = (newDestination?: InfluenceEntity) => {
    if (
      newDestination &&
      selectedDestinations.every((a) => a[0] !== newDestination.id)
    ) {
      setSelectedDestinations(
        flow(A.append([newDestination.id, getEntityName(newDestination)]))
      )
    }
  }
  const removeDestination = (asteroidId: number) =>
    setSelectedDestinations(A.reject((a) => a[0] === asteroidId))

  const saveDestinations = () => {
    setParams({ destinations: selectedDestinations.map((a) => a[0]) })
    setDialogOpen(false)
  }

  const destinationLimitReached = selectedDestinations.length >= 10

  return (
    <div className='flex gap-x-3'>
      <div>
        <Label>Origin Asteroid</Label>
        <AsteroidSelect
          asteroidId={params.origin}
          onAsteroidChange={(asteroid) => setParams({ origin: asteroid?.id })}
        />
      </div>
      <div className='flex flex-col justify-end'>
        <Label className='mb-1'>Destination Asteroids</Label>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o)
            if (!o) {
              setSelectedDestinations(initialSelectedDestinations)
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant='outline' onClick={() => setDialogOpen(true)}>
              {match(selectedDestinations)
                .returnType<ReactNode>()
                .with([], () => 'Select Destination')
                .with([P._], ([[, name]]) => name)
                .with(P.array(P._), (arr) => `${arr.length} Destinations`)
                .exhaustive()}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Destination Asteroids</DialogTitle>
            </DialogHeader>
            <div>
              <AsteroidSelect
                onAsteroidChange={addDestination}
                disabled={destinationLimitReached}
              />
              {destinationLimitReached && (
                <p className='text-sm text-warning'>
                  You have reached the limit of 10 destinations.
                </p>
              )}
            </div>
            <div className='grid grid-cols-[min-content,1fr] items-center gap-y-1'>
              {selectedDestinations.map(([id, name]) => (
                <Fragment key={id}>
                  <Button
                    className='text-destructive hover:text-destructive'
                    variant='ghost'
                    onClick={() => removeDestination(id)}
                  >
                    <Trash />
                  </Button>
                  <p>{name}</p>
                </Fragment>
              ))}
            </div>
            <DialogFooter>
              <Button
                disabled={selectedDestinations.length === 0}
                onClick={saveDestinations}
              >
                Save Destinations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
