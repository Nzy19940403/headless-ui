import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { BadgeContract } from '@demo/ui-core'

export interface HBadgeProps extends BadgeContract, PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {}

export function HBadge({ tone = 'neutral', dot, className, children, ...props }: HBadgeProps) {
  return (
    <span
      {...props}
      className={['ui-badge', `ui-badge--${tone}`, dot ? 'ui-badge--dot' : '', className].filter(Boolean).join(' ')}
    >
      {dot ? null : children}
    </span>
  )
}
