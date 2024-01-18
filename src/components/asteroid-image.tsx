import Image from 'next/image'
import Link from 'next/link'

export type AsteroidImageProps = {
  className?: string
  id: number
  width: number
}

export const AsteroidImage = ({ className, id, width }: AsteroidImageProps) => {
  const url = `https://images.influenceth.io/v1/asteroids/${id}/image.svg`

  return (
    <Link className={className} href={`/asteroids/${id}`}>
      <Image
        src={url}
        width={width}
        height={width * 1.333}
        alt={`Asteroid #${id}`}
      />
    </Link>
  )
}
