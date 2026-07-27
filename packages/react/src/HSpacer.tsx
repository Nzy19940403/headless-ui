import type { HTMLAttributes } from 'react'
import type { SpacerContract } from '@demo/ui-core'
import { spacerClassName, spacerStyle } from './layout-style'

export interface HSpacerProps extends SpacerContract, HTMLAttributes<HTMLDivElement> {}

export function HSpacer({
  size = 'md',
  grow = true,
  className,
  style,
  ...props
}: HSpacerProps) {
  const contract = { size, grow }
  return (
    <div
      {...props}
      aria-hidden
      className={spacerClassName(contract, className)}
      style={{ ...spacerStyle(contract), ...style }}
    />
  )
}
