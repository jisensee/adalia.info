import { Globe, Orbit } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FC, HTMLAttributeAnchorTarget, PropsWithChildren } from 'react'
import { Route } from 'next'
import { buildAsteroidsUrl } from '../app/asteroids/types'
import { Button } from '@/components/ui/button'
import { AsteroidImage } from '@/components/asteroid-image'
import { cn } from '@/lib/utils'

export type AsteroidPreviewProps = {
  id: number
  orbitalPeriod: number
  alwaysVertical?: boolean
}

export const AsteroidPreview: FC<AsteroidPreviewProps> = ({
  id,
  orbitalPeriod,
  alwaysVertical,
}) => {
  const actions = (
    <div className='flex flex-col items-center justify-center gap-3'>
      <ActionButton href={`/asteroids/${id}` as Route} icon={<Orbit />}>
        Details
      </ActionButton>
      <ActionButton
        href={`https://game.influenceth.io/asteroids/${id}`}
        target='_blank'
        icon={
          <Image
            src='/influence-logo.svg'
            width={25}
            height={25}
            alt='Influence logo'
          />
        }
      >
        Game
      </ActionButton>
      <ActionButton
        href={buildAsteroidsUrl({
          orbitalPeriod: [orbitalPeriod, orbitalPeriod],
        })}
        icon={<Globe />}
      >
        Co-Orbitals
      </ActionButton>
    </div>
  )

  return (
    <div
      className={cn('flex flex-col gap-3', {
        'sm:w-auto sm:flex-row': !alwaysVertical,
      })}
    >
      <AsteroidImage id={id} width={350} />
      {actions}
    </div>
  )
}

type ActionButtonProps = {
  href: Route
  icon: React.ReactNode
  target?: HTMLAttributeAnchorTarget
} & PropsWithChildren
const ActionButton = ({ href, icon, target, children }: ActionButtonProps) => (
  <Link href={href} className='w-52' target={target}>
    <Button variant='outline' className='w-full' icon={icon}>
      {children}
    </Button>
  </Link>
)
