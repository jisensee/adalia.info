'use client'

import { Globe, Orbit } from 'lucide-react'
import Link from 'next/link'
import { HTMLAttributeAnchorTarget, PropsWithChildren } from 'react'
import { Route } from 'next'
import { Logo } from './logo'
import { useAsteroidFilterNavigation } from './asteroid-filters/hooks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

export const AsteroidDetailsButton = ({
  id,
  className,
}: AsteroidActionButtonProps) => (
  <ActionButton
    className={className}
    href={`/asteroids/${id}` as Route}
    icon={<Orbit />}
  >
    Details
  </ActionButton>
)
export const AsteroidGameButton = ({
  id,
  className,
}: AsteroidActionButtonProps) => (
  <ActionButton
    className={className}
    href={`https://game.influenceth.io/asteroids/${id}`}
    target='_blank'
    icon={<Logo.Influence size={25} />}
  >
    Game
  </ActionButton>
)
export const AsteroidCoorbitalsButton = ({
  className,
  semiMajorAxis,
}: {
  className?: string
  semiMajorAxis: number
}) => {
  const navigate = useAsteroidFilterNavigation()
  return (
    <Button
      variant='outline'
      className={cn('w-full', className)}
      icon={<Globe />}
      onClick={() =>
        navigate({
          semiMajorAxis: {
            from: semiMajorAxis,
            to: semiMajorAxis,
          },
        })
      }
    >
      Co-Orbitals
    </Button>
  )
}
