import type { HTMLAttributes } from 'react'
import type { SeparatorContract } from '@demo/ui-core'

export interface HSeparatorProps extends SeparatorContract, HTMLAttributes<HTMLDivElement> {}

export function HSeparator({ orientation = 'horizontal', className, ...props }: HSeparatorProps) {
  return (
    <div
      {...props}
      role="separator"
      aria-orientation={orientation}
      className={['ui-separator', `ui-separator--${orientation}`, className].filter(Boolean).join(' ')}
    />
  )
}
