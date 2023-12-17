'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, children, ...props }, ref) => {
  const progress = (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-white',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className='h-full w-full flex-1 bg-primary transition-all duration-500'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
  if (children) {
    return (
      <div className='relative'>
        <div className='absolute z-50 flex h-full w-full items-center justify-center text-primary-foreground'>
          {children}
        </div>
        {progress}
      </div>
    )
  }
  return progress
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
