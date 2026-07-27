import type { ComponentContent } from './shared'
import type { OpenChangeDetails, OpenChangeHandler } from './dialog-contract'

export type { OpenChangeDetails, OpenChangeHandler }

/**
 * Which edge the panel is attached to.
 * Maps to Zag/Ark `swipeDirection`: left→start, right→end, top→up, bottom→down.
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerContract<TContent = ComponentContent> {
  trigger: TContent
  title: TContent
  description?: TContent
  children?: TContent
  /** Controlled open state. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: OpenChangeHandler
  /**
   * Edge placement. Default `right` (detail panel).
   * `bottom` behaves like a sheet.
   */
  placement?: DrawerPlacement
  /**
   * Panel size along the primary axis.
   * left/right → width; top/bottom → height.
   * CSS length, e.g. `360px`, `28rem`, `80%`.
   * Default `360px`.
   */
  size?: string
}

/** Map public placement → Zag swipeDirection. */
export function drawerSwipeDirection(
  placement: DrawerPlacement = 'right',
): 'up' | 'down' | 'start' | 'end' {
  switch (placement) {
    case 'left':
      return 'start'
    case 'right':
      return 'end'
    case 'top':
      return 'up'
    case 'bottom':
      return 'down'
    default:
      return 'end'
  }
}
