import { Globe, Orbit } from 'lucide-react'
import Link from 'next/link'
import { HTMLAttributeAnchorTarget, PropsWithChildren } from 'react'
import { Route } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type ActionButtonProps = {
  className?: string
  href: Route
  icon: React.ReactNode
  target?: HTMLAttributeAnchorTarget
} & PropsWithChildren
const ActionButton = ({
  className,
  href,
  icon,
  target,
  children,
}: ActionButtonProps) => (
  <Link href={href} className={className} target={target}>
    <Button variant='outline' className='w-full' icon={icon}>
      {children}
    </Button>
  </Link>
)

export type AsteroidActionButtonProps = {
  className?: string
  id: number
}

export const AsteroidActionButton = {
  Details: ({ id, className }: AsteroidActionButtonProps) => (
    <ActionButton
      className={className}
      href={`/asteroids/${id}` as Route}
      icon={<Orbit />}
    >
      Details
    </ActionButton>
  ),
  Game: ({ id, className }: AsteroidActionButtonProps) => (
    <ActionButton
      className={className}
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
  ),
  Coorbitals: ({
    className,
    orbitalPeriod,
  }: {
    className?: string
    orbitalPeriod: number
  }) => (
    <ActionButton
      className={className}
      href={`/asteroids?orbitalPeriod=${encodeURI(
        JSON.stringify({ from: orbitalPeriod, to: orbitalPeriod })
      )}`}
      icon={<Globe />}
    >
      Co-Orbitals
    </ActionButton>
  ),
}
