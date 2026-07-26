import type { HTMLAttributes, PropsWithChildren } from 'react'
import type { TagTone } from '@demo/ui-core'

export interface TagProps extends PropsWithChildren<HTMLAttributes<HTMLSpanElement>> {
  tone?: TagTone
}

export function Tag({ tone = 'neutral', className, ...props }: TagProps) {
  return <span {...props} className={['ui-tag', `ui-tag--${tone}`, className].filter(Boolean).join(' ')} />
}
