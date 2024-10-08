import NextImage from 'next/image'
import { getEntityName, InfluenceEntity } from 'influence-typed-sdk/api'
import { influenceImages } from '@/lib/influence-api/api'

export type CrewImageProps = {
  crew: InfluenceEntity
  width: number
}
export const CrewImage = ({ crew, width }: CrewImageProps) => {
  const roster = crew.Crew?.roster ?? []
  const captain = roster[0]
  if (!captain) return null
  const name = getEntityName(crew)

  return (
    <div className='flex items-end'>
      <CrewmateImage crewmateId={captain} width={width * 1.45} />
      <div className='space-y-1'>
        <h2 className='pl-2'>{name}</h2>
        <div className='flex flex-wrap'>
          {roster.slice(1).map((id) => (
            <CrewmateImage key={id} crewmateId={id} width={width} />
          ))}
        </div>
      </div>
    </div>
  )
}

export type CrewmateImageProps = {
  crewmateId: number
  width: number
  className?: string
}

export const CrewmateImage = ({
  crewmateId,
  width,
  className,
}: CrewmateImageProps) => (
  <NextImage
    className={className}
    src={influenceImages.crewmate(crewmateId, { width })}
    alt={`crewmate ${crewmateId}`}
    width={width}
    height={width * 1.333}
    unoptimized
  />
)
