import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div className='space-y-3 p-3'>
      <h1>Tools</h1>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        <Link href='/tools/process-finder'>
          <div className='group flex flex-col items-center justify-center rounded border border-primary p-5 hover:bg-primary'>
            <h2 className='group-hover:text-primary-foreground'>
              Process Finder
            </h2>
            <p className='text-md group-hover:text-primary-foreground'>
              Find out what you can make from your leftover products!
            </p>
          </div>
        </Link>
        <Link href='/tools/production-tracker'>
          <div className='group flex flex-col items-center justify-center rounded border border-primary p-5 hover:bg-primary'>
            <h2 className='group-hover:text-primary-foreground'>
              Production Tracker
            </h2>
            <p className='text-md group-hover:text-primary-foreground'>
              Easily keep track of all your running production facilities!
            </p>
          </div>
        </Link>
        <Link href='/tools/crew-tracker'>
          <div className='group flex flex-col items-center justify-center rounded border border-primary p-5 hover:bg-primary'>
            <h2 className='group-hover:text-primary-foreground'>
              Crew Tracker
            </h2>
            <p className='text-md group-hover:text-primary-foreground'>
              Easily keep track of all your crews!
            </p>
          </div>
        </Link>
        <Link href='/tools/trader-dashboard'>
          <div className='group flex flex-col items-center justify-center rounded border border-primary p-5 hover:bg-primary'>
            <h2 className='group-hover:text-primary-foreground'>
              Trader Dashboard
            </h2>
            <p className='text-md group-hover:text-primary-foreground'>
              Keep track of your trading activities!
            </p>
          </div>
        </Link>
        <Link href='/tools/public-buildings'>
          <div className='group flex flex-col items-center justify-center rounded border border-primary p-5 hover:bg-primary'>
            <h2 className='group-hover:text-primary-foreground'>
              Public Buildings
            </h2>
            <p className='text-md group-hover:text-primary-foreground'>
              Find buildings for public use!
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
