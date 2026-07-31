import type { ComponentContent } from './shared'
import type { PresenceContract } from './presence-contract'

/** Payload for open / close transitions. */
export interface OpenChangeDetails {
  open: boolean
}

export type OpenChangeHandler = (details: OpenChangeDetails) => void

export interface DialogContract<TContent = ComponentContent> extends PresenceContract {
  trigger?: TContent
  title: TContent
  description?: TContent
  children?: TContent
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: OpenChangeHandler
}
