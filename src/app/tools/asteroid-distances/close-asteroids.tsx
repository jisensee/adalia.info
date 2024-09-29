import { Asteroid, Building } from '@influenceth/sdk'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { A, F, O, pipe } from '@mobily/ts-belt'
import { startOfDay } from 'date-fns'
import { useQueryStates } from 'nuqs'
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Link from 'next/link'
import { getMatchingOrbits } from './actions'
import { distancesAtTime } from './distances'
import { asteroidDistancesParams, Trip } from './params'
import { Toggle } from '@/components/ui/toggle'
import { AsteroidSelect } from '@/components/asteroid-select'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { DataTable } from '@/components/ui/data-table'
import { Format } from '@/lib/format'

const availableBuildingFilters = [
  Building.IDS.MARKETPLACE,
  Building.IDS.SPACEPORT,
  Building.IDS.HABITAT,
]

type DistanceEntry = ReturnType<typeof distancesAtTime>[number]

export const CloseAsteroids = () => {
  const [originAsteroid, setOriginAsteroid] = useState<InfluenceEntity>()
  const [requiredBuildings, setRequiredBuildings] = useState<number[]>([])
  const [date, setDate] = useState(startOfDay(new Date()))

  const {
    data: distances,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['close-asteroids', originAsteroid?.id, requiredBuildings, date],
    placeholderData: F.identity,
    queryFn: async () => {
      if (!originAsteroid) return
      const orbits = await getMatchingOrbits(
        originAsteroid?.id,
        requiredBuildings
      )
      return pipe(
        distancesAtTime(originAsteroid, orbits, date),
        A.sortBy((d) => d.distance)
      )
    },
    enabled: false,
  })

  return (
    <div>
      <h2>Close Asteroids</h2>
      <p>Find asteroids that are close to a given origin at a certain date.</p>

      <div className='flex flex-wrap items-end gap-3'>
        <div className='space-y-1'>
          <h3>Origin Asteroid</h3>
          <AsteroidSelect
            asteroidId={originAsteroid?.id}
            onAsteroidChange={setOriginAsteroid}
          />
        </div>
        <div className='space-y-1'>
          <h3>Time</h3>
          <DatePicker
            date={date}
            onDateChange={(d) => (d ? setDate(d) : undefined)}
          />
        </div>

        <div className='space-y-1'>
          <h3>Required Buildings</h3>
          <div className='flex flex-wrap gap-2'>
            {availableBuildingFilters.map((building) => (
              <Toggle
                key={building}
                variant='outline'
                pressed={requiredBuildings.includes(building)}
                onPressedChange={(pressed) =>
                  setRequiredBuildings(
                    pressed
                      ? [...requiredBuildings, building]
                      : requiredBuildings.filter((b) => b !== building)
                  )
                }
              >
                {Building.getType(building).name}
              </Toggle>
            ))}
          </div>
        </div>
        <Button
          icon={<Search />}
          onClick={() => refetch()}
          loading={isFetching}
          disabled={!originAsteroid}
        >
          Find Close Asteroids
        </Button>
      </div>
      {originAsteroid && distances && (
        <div className='mt-3 space-y-2'>
          <CloseAsteroidsTable
            data={distances}
            origin={originAsteroid}
            loading={isFetching}
          />
        </div>
      )}
    </div>
  )
}

const makeColumns = (
  onAdd: (destination: InfluenceEntity) => void,
  origin: number,
  trips: Trip[]
): ColumnDef<DistanceEntry>[] => [
  {
    id: 'name',
    header: 'Name',
    accessorFn: (row) => getEntityName(row.destination),
    enableSorting: true,
    cell: ({ row }) => (
      <Link
        className='text-primary hover:underline'
        href={`/asteroids/${row.original.destination.id}`}
        target='_blank'
      >
        {getEntityName(row.original.destination)}
      </Link>
    ),
  },
  {
    id: 'spectral-type',
    header: 'Spectral Type',
    accessorFn: (row) =>
      O.map(
        row.destination.Celestial?.celestialType,
        Asteroid.getSpectralType
      )?.toUpperCase(),
    enableSorting: true,
  },
  {
    id: 'distance',
    header: 'Distance',
    accessorFn: (row) => Format.asteroidDistance(row.distance),
    enableSorting: true,
  },
  {
    id: 'actions',
    header: '',
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        icon={<Plus />}
        onClick={() => onAdd(row.original.destination)}
        disabled={trips.some(
          (t) =>
            t.origin === origin && t.destination === row.original.destination.id
        )}
      >
        Add To Chart
      </Button>
    ),
  },
]

type CloseAsteroidsTableProps = {
  data: DistanceEntry[]
  origin: InfluenceEntity
  loading?: boolean
}

const CloseAsteroidsTable = ({
  data,
  origin,
  loading,
}: CloseAsteroidsTableProps) => {
  const [{ trips }, setParams] = useQueryStates(asteroidDistancesParams)
  const columns = makeColumns(
    (destination) =>
      setParams(({ trips }) => ({
        trips: [...trips, { origin: origin.id, destination: destination.id }],
      })),
    origin.id,
    trips
  )
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [
        {
          id: 'distance',
          desc: false,
        },
      ],
    },
  })

  return <DataTable table={table} loading={loading} />
}
