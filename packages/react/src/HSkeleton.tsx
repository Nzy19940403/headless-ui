import type { HTMLAttributes } from 'react'
import type { SkeletonContract } from '@demo/ui-core'

export interface HSkeletonProps extends SkeletonContract, HTMLAttributes<HTMLDivElement> {}

export function HSkeleton({
  width = '100%',
  height = '1rem',
  circle,
  animated = true,
  className,
  style,
  ...props
}: HSkeletonProps) {
  return (
    <div
      {...props}
      className={['ui-skeleton', circle ? 'ui-skeleton--circle' : '', animated ? 'ui-skeleton--animated' : '', className].filter(Boolean).join(' ')}
      style={{ width: circle ? height : width, height, ...style }}
      aria-hidden
    />
  )
}
