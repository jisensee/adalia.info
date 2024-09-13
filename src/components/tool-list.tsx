import {
  Building,
  ChartNoAxesCombined,
  ChartSpline,
  Cog,
  Cpu,
  LandPlot,
  LucideProps,
  Rocket,
  UsersRound,
} from 'lucide-react'
import { Route } from 'next'
import Link from 'next/link'
import { ComponentType } from 'react'

export const ToolList = () => (
  <>
    <ToolLink
      href='/tools/process-finder'
      title='Process Finder'
      description='Find out what you can make from your leftover products'
      icon={Cpu}
    />
    <ToolLink
      href='/tools/production-tracker'
      title='Production Tracker'
      description='Easily keep track of all your running production facilities'
      icon={Cog}
    />
    <ToolLink
      href='/tools/crew-tracker'
      title='Crew Tracker'
      description='Easily keep track of all your crews'
      icon={UsersRound}
    />
    <ToolLink
      href='/tools/trader-dashboard'
      title='Trader Dashboard'
      description='Keep track of your trading activities'
      icon={ChartNoAxesCombined}
    />
    <ToolLink
      href='/tools/public-buildings'
      title='Public Buildings'
      description='Find buildings for public use'
      icon={Building}
    />
    <ToolLink
      href='/tools/ships-for-sale'
      title='Ships For Sale'
      description='Find all ships that are currently for sale'
      icon={Rocket}
    />
    <ToolLink
      href='/tools/expiring-lots'
      title='Expiring Lots'
      description='Find all lots with buildings which leases will expire soon'
      icon={LandPlot}
    />
    <ToolLink
      href='/tools/asteroid-distances'
      title='Asteroid Distances'
      description='Visualize the distance between asteroids over time'
      icon={ChartSpline}
    />
  </>
)

type ToolLinkProps = {
  href: Route
  title: string
  description: string
  icon: ComponentType<LucideProps>
}
const ToolLink = ({ href, title, description, icon: Icon }: ToolLinkProps) => (
  <Link href={href}>
    <div className='group flex h-full w-full items-center gap-x-5 rounded border border-primary p-5 hover:bg-primary'>
      <Icon size={48} className='group-hover:text-primary-foreground' />
      <div className='flex w-full flex-col items-center justify-center'>
        <h2 className='group-hover:text-primary-foreground'>{title}</h2>
        <p className='text-md text-center group-hover:text-primary-foreground'>
          {description}
        </p>
      </div>
    </div>
  </Link>
)
