import { LoadingIndicator } from '@/components/loading-indicator'

export default function Loading() {
  return (
    <div className='flex h-full w-full items-center justify-center'>
      <LoadingIndicator className='h-32 w-32 text-primary' />
    </div>
  )
}
