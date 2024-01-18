import { Orbit } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LoadingIndicator = ({ className }: { className?: string }) => (
  <Orbit className={cn('animate-spin', className)} />
)
