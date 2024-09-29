'use client'
import { useQueryStates } from 'nuqs'
import { useState } from 'react'
import { MoveHorizontal, Plus, Trash } from 'lucide-react'
import { getEntityName } from 'influence-typed-sdk/api'
import { asteroidDistancesParams } from './params'
import { ResolvedTrip } from './actions'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { pluralize } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { AsteroidSelect } from '@/components/asteroid-select'

export type AsteroidTripsFormProps = {
  trips: ResolvedTrip[]
}
export const AsteroidTripsForm = ({ trips }: AsteroidTripsFormProps) => {
  const [addTripOpen, setAddTripOpen] = useState(false)
  const [tripOverviewOpen, setTripOverviewOpen] = useState(false)

  return (
    <div className='flex gap-x-3'>
      <Dialog open={tripOverviewOpen} onOpenChange={setTripOverviewOpen}>
        <DialogTrigger asChild>
          <Button variant='outline' onClick={() => setTripOverviewOpen(true)}>
            {trips.length} {pluralize(trips.length, 'Trip')}
          </Button>
        </DialogTrigger>
        <TripOverviewDialogContent
          trips={trips}
          onAddTrip={() => {
            setTripOverviewOpen(false)
            setAddTripOpen(true)
          }}
          onClose={() => setTripOverviewOpen(false)}
        />
      </Dialog>
      <Dialog open={addTripOpen} onOpenChange={setAddTripOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setAddTripOpen(true)} icon={<Plus />}>
            Add Trip
          </Button>
        </DialogTrigger>
        <AddTripDialogContent onClose={() => setAddTripOpen(false)} />
      </Dialog>
    </div>
  )
}

type AddTripDialogContentProps = {
  onClose: () => void
}
const AddTripDialogContent = ({ onClose }: AddTripDialogContentProps) => {
  const [, setParams] = useQueryStates(asteroidDistancesParams)
  const [origin, setOrigin] = useState<number>()
  const [destination, setDestination] = useState<number>()
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Trip</DialogTitle>
      </DialogHeader>
      <div className='space-y-2'>
        <div>
          <Label>Origin Asteroid</Label>
          <AsteroidSelect
            asteroidId={origin}
            onAsteroidChange={(a) => setOrigin(a?.id)}
          />
        </div>
        <div>
          <Label>Destination Asteroid</Label>
          <AsteroidSelect
            asteroidId={destination}
            onAsteroidChange={(a) => setDestination(a?.id)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!origin || !destination}
          icon={<Plus />}
          onClick={() => {
            if (!origin || !destination) return
            setParams((params) => ({
              ...params,
              trips: [...(params.trips ?? []), { origin, destination }],
            }))
            onClose()
          }}
        >
          Add
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

type TripOverviewDialogContentProps = {
  trips: ResolvedTrip[]
  onAddTrip: () => void
  onClose: () => void
}
const TripOverviewDialogContent = ({
  trips,
  onAddTrip,
  onClose,
}: TripOverviewDialogContentProps) => {
  const [, setParams] = useQueryStates(asteroidDistancesParams)
  const removeTrip = (trip: ResolvedTrip) =>
    setParams((params) => ({
      trips: params.trips.filter(
        (t) =>
          t.origin !== trip.origin.id || t.destination !== trip.destination.id
      ),
    }))
  const removeAllTrips = () => {
    onClose()
    setParams((params) => ({
      ...params,
      trips: [],
    }))
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Trip Overview</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col gap-y-1'>
        {trips.map((trip) => (
          <div key={trip.id} className='flex gap-x-3'>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => removeTrip(trip)}
            >
              <Trash />
            </Button>
            <div className='flex items-center gap-x-2'>
              <span className='text-xl text-primary'>
                {getEntityName(trip.origin)}
              </span>
              <MoveHorizontal size={32} />
              <span className='text-xl text-primary'>
                {getEntityName(trip.destination)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant='outline' onClick={onClose}>
          Close
        </Button>
        {trips.length > 0 && (
          <Button
            variant='destructive'
            onClick={removeAllTrips}
            icon={<Trash />}
          >
            Clear Trips
          </Button>
        )}
        <Button onClick={onAddTrip} icon={<Plus />}>
          Add Trip
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
