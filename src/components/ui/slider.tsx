'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    logScale?: boolean
  }
>(
  (
    { className, logScale, step, min, max, value, onValueChange, ...props },
    ref
  ) => {
    const adjustedProps = React.useMemo(() => {
      if (
        !logScale ||
        !value ||
        min === undefined ||
        max === undefined ||
        step === undefined
      ) {
        return { step, min, max, value, onValueChange }
      }

      const curve = Math.log1p
      const inverse = Math.expm1
      const steps = (max - min) / step
      const newMin = curve(min)
      const newMax = curve(max)
      const newValue = value.map(curve)
      const newStep = (newMax - newMin) / steps
      return {
        min: newMin,
        max: newMax,
        value: newValue,
        step: newStep,
        onValueChange: (newValues: number[]) =>
          onValueChange?.(newValues.map(inverse)),
      }
    }, [logScale, step, min, max, value, onValueChange])

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className,
          {
            'cursor-not-allowed opacity-50': props.disabled,
          }
        )}
        {...props}
        {...adjustedProps}
      >
        <SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-foreground'>
          <SliderPrimitive.Range className='absolute h-full bg-primary' />
        </SliderPrimitive.Track>
        {adjustedProps.value?.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            className='block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          />
        ))}
      </SliderPrimitive.Root>
    )
  }
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
