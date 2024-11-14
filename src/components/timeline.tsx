import * as React from 'react'
import { cn } from '@/lib/utils'

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
))
Timeline.displayName = 'Timeline'

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative flex flex-col p-6 pb-2 pt-0', className)}
    {...props}
  />
))
TimelineItem.displayName = 'TimelineItem'

const TimelineTime = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('absolute text-sm font-semibold leading-none', className)}
    {...props}
  />
))
TimelineTime.displayName = 'TimelineTime'

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute left-[30px] top-[5px] h-full w-px -translate-x-1/2 translate-y-2 bg-primary',
      className
    )}
    {...props}
  />
))
TimelineConnector.displayName = 'TimelineConnector'

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
))
TimelineHeader.displayName = 'TimelineHeader'

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight ', className)}
    {...props}
  >
    {children}
  </h3>
))
TimelineTitle.displayName = 'CardTitle'

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex size-3 flex-col rounded-full bg-primary', className)}
    {...props}
  />
))
TimelineIcon.displayName = 'TimelineIcon'

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('ml-1 max-w-sm text-sm text-muted-foreground', className)}
    {...props}
  />
))
TimelineDescription.displayName = 'TimelineDescription'

const TimelineContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col items-start p-6 pt-0', className)}
    {...props}
  />
))
TimelineContent.displayName = 'TimelineContent'

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
  TimelineTime,
}
