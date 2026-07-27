import type { ComponentContent } from './shared'

/** Payload for open / close transitions. */
export interface OpenChangeDetails {
  open: boolean
}

export type OpenChangeHandler = (details: OpenChangeDetails) => void

export interface DialogContract<TContent = ComponentContent> {
  trigger: TContent
  title: TContent
  description?: TContent
  children?: TContent
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: OpenChangeHandler
}
