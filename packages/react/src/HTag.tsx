import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { TagContract } from '@demo/ui-core'

export interface HTagProps extends TagContract, PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {}

export function HTag({ tone = 'neutral', size = 'md', content, children, className, ...props }: HTagProps) {
  return (
    <span {...props} className={['ui-tag', `ui-tag--${tone}`, `ui-tag--${size}`, className].filter(Boolean).join(' ')}>
      {children ?? content}
    </span>
  )
}
