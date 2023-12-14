import { PropsWithChildren, ReactNode } from 'react'

export type ChartContainerProps = {
  title: ReactNode
} & PropsWithChildren

export const ChartContainer = ({ children, title }: ChartContainerProps) => (
  <div className='h-96 w-fit rounded-md border border-primary px-4 py-2'>
    <h2>{title}</h2>
    {children}
  </div>
)
