'use client'

import { Copy } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider } from './ui/tooltip'

export type CopyButtonProps = {
  value: string
  copiedMessage: ReactNode
}
export const CopyButton = ({ value, copiedMessage }: CopyButtonProps) => {
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const onCopy = () => {
    navigator.clipboard.writeText(value)
    setTooltipOpen(true)
    setTimeout(() => setTooltipOpen(false), 2000)
  }
  return (
    <TooltipProvider>
      <Tooltip open={tooltipOpen}>
        <TooltipTrigger asChild>
          <Button
            variant='ghost'
            size='iconSm'
            icon={<Copy />}
            onClick={onCopy}
          />
        </TooltipTrigger>
        <TooltipContent>{copiedMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
