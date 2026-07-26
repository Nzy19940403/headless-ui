import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import type { CardVariant } from '@demo/ui-core'

export interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLElement>> {
  title?: ReactNode
  description?: ReactNode
  variant?: CardVariant
}

export function Card({ title, description, variant = 'surface', className, children, ...props }: CardProps) {
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
