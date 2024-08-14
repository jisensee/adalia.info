'use client'

import { Copy } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export type CopyButtonProps = {
  value: string
  copiedMessage: ReactNode
  large?: boolean
}
export const CopyButton = ({
  value,
  copiedMessage,
  large,
}: CopyButtonProps) => {
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
            size={large ? 'icon' : 'iconSm'}
            icon={<Copy />}
            onClick={onCopy}
          />
        </TooltipTrigger>
        <TooltipContent>{copiedMessage}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
