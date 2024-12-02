import { Info } from 'lucide-react'
import Link from 'next/link'
import { getTotalVisitedAsteroids, Race } from './data'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const VisitedAsteroids = ({
  race,
  asteroidNames,
}: {
  race: Race
  asteroidNames: Map<number, string>
}) => {
  const totalVisitedAsteroids = getTotalVisitedAsteroids(race)
  return (
    <div className='flex flex-col items-center gap-x-3'>
      <p className='font-bold text-primary'>Visited Asteroids</p>
      <div className='flex items-center gap-x-2'>
        <p className='text-xl'>{totalVisitedAsteroids.length}</p>
        <Dialog>
          <DialogTrigger>
            <Info />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {totalVisitedAsteroids.length} visited asteroids
              </DialogTitle>
            </DialogHeader>
            <div className='max-h-[60vh] overflow-y-auto'>
              <Table className='w-full'>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asteroid</TableHead>
                    <TableHead>Visits</TableHead>
                    <TableHead>Visitors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalVisitedAsteroids.map(
                    ({ asteroid, visits, visitors }) => (
                      <TableRow key={asteroid}>
                        <TableCell>
                          <Link
                            href={`/asteroids/${asteroid}`}
                            className='hover:underline'
                          >
                            {asteroidNames.get(asteroid) ?? asteroid}
                          </Link>
                        </TableCell>
                        <TableCell>{visits}</TableCell>
                        <TableCell>{visitors}</TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
