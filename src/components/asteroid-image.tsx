import Image from 'next/image'
import Link from 'next/link'
import { influenceImages } from '@/lib/influence-api/api'

export type AsteroidImageProps = {
  className?: string
  id: number
  width: number
}

export const AsteroidImage = ({ className, id, width }: AsteroidImageProps) => (
  <Link className={className} href={`/asteroids/${id}`}>
    <Image
      src={influenceImages.asteroid(id, { width })}
      width={width}
      height={width * 1.333}
      alt={`Asteroid #${id}`}
    />
  </Link>
)
