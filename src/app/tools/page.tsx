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
      </div>
    </div>
  )
}
