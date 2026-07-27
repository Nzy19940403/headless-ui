import type { ComponentContent } from './shared'

export interface EmptyContract<TContent = ComponentContent> {
  title?: TContent
  description?: TContent
}
