import Image from 'next/image'

export type AsteroidImageProps = {
  className?: string
  id: number
  width: number
}

export const AsteroidImage = ({ className, id, width }: AsteroidImageProps) => {
  const url = `https://images.influenceth.io/v1/asteroids/${id}/image.svg`

  return (
    <Image
      className={className}
      src={url}
      width={width}
      height={width * 1.333}
      alt={`Asteroid #${id}`}
    />
  )
}
