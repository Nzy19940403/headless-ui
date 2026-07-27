import type { ReactNode } from 'react'
import type { EmptyContract } from '@demo/ui-core'

export interface HEmptyProps extends EmptyContract<ReactNode> {
  className?: string
  children?: ReactNode
}

export function HEmpty({ title = 'No data', description, children, className }: HEmptyProps) {
  return (
    <div className={['ui-empty', className].filter(Boolean).join(' ')}>
      <div className="ui-empty__icon" aria-hidden>○</div>
      {title ? <h3 className="ui-empty__title">{title}</h3> : null}
      {description ? <p className="ui-empty__description">{description}</p> : null}
      {children ? <div className="ui-empty__action">{children}</div> : null}
    </div>
  )
}
