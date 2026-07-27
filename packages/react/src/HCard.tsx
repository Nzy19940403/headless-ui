import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import type { CardContract } from '@demo/ui-core'

export interface HCardProps extends CardContract<ReactNode>, PropsWithChildren<Omit<HTMLAttributes<HTMLElement>, 'title'>> {}

export function HCard({ title, description, variant = 'surface', className, children, ...props }: HCardProps) {
  return (
    <section {...props} className={['ui-card', `ui-card--${variant}`, className].filter(Boolean).join(' ')}>
      {title || description ? (
        <header className="ui-card__header">
          {title ? <h3 className="ui-card__title">{title}</h3> : null}
          {description ? <p className="ui-card__description">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
