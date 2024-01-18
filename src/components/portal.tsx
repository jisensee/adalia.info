'use client'
import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type PortalProps = {
  selector: string
} & PropsWithChildren

export const Portal: FC<PortalProps> = ({ selector, children }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isMounted) {
    const container = document.querySelector(selector)
    if (!container) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return createPortal(children, container)
  }
  return null
}
