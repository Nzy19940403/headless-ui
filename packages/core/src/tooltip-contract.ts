import type { ComponentContent } from './shared'
import type { OpenChangeHandler } from './dialog-contract'

export interface TooltipContract<TContent = ComponentContent> {
  content: TContent
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  positioning?: 'top' | 'bottom' | 'left' | 'right'
  onOpenChange?: OpenChangeHandler
}
