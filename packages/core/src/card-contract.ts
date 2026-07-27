import type { ComponentContent } from './shared'

export type CardVariant = 'surface' | 'muted'

export interface CardContract<TContent = ComponentContent> {
  title?: TContent
  description?: TContent
  variant?: CardVariant
}
