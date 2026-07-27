import * as drawer from '@zag-js/drawer'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { DrawerContract, DrawerPlacement, OpenChangeDetails } from '@demo/ui-core'
import { drawerSwipeDirection } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
  booleanAttribute,
} from './compound'

/**
 * Light-DOM drawer over `@zag-js/drawer`.
 *
 * Zag enters `closing` and waits for a content `exitcomplete` event (same as
 * Presence). We do not apply Zag's immediate `hidden` while exiting; instead:
 * 1. set data-state=closed (CSS exit animation runs)
 * 2. listen for animationend on content
 * 3. dispatch `exitcomplete` so the machine can finish → closed
 */
export class HDrawer extends ZagRootElement<typeof drawer> {
  static observedAttributes = ['open', 'default-open', 'placement', 'size']

  declare defaultOpen: DrawerContract['defaultOpen']
  declare placement: DrawerPlacement
  declare size: string

  private _open: boolean | undefined
  private _openSet = false
  /** True while exit CSS animation is running (keep visible). */
  private _exiting = false
  private _exitCleanup?: () => void

  get open(): boolean | undefined {
    return this._openSet ? this._open : booleanAttribute(this.getAttribute('open'))
  }

  set open(value: boolean | undefined | null) {
    if (value === null || value === undefined) {
      this._open = undefined
      this._openSet = false
      this.removeAttribute('open')
      this.updateMachineProps({ open: undefined })
      return
    }
    this._open = Boolean(value)
    this._openSet = true
    this.setAttribute('open', this._open ? '' : 'false')
    this.updateMachineProps({ open: this._open })
  }

  private _onOpenChange?: DetailHandler<OpenChangeDetails>

  get onOpenChange() {
    return this._onOpenChange
  }

  set onOpenChange(handler: DetailHandler<OpenChangeDetails> | null | undefined) {
    this._onOpenChange = asDetailHandler(handler)
  }

  constructor() {
    super()
    this.placement = 'right'
    this.size = '360px'
  }

  protected createMachine(): VanillaMachine<any> {
    const placement = (this.getAttribute('placement') as DrawerPlacement) || this.placement || 'right'
    const size = this.getAttribute('size') || this.size || '360px'
    this.placement = placement
    this.size = size
    this.style.setProperty('--ui-drawer-size', size)
    this.dataset.placement = placement

    return new VanillaMachine(drawer.machine, {
      id: `h-drawer-${crypto.randomUUID()}`,
      open: this.open,
      defaultOpen: this.hasAttribute('default-open'),
      swipeDirection: drawerSwipeDirection(placement),
      onOpenChange: ({ open }) => {
        if (!open) {
          // Enter local exit phase before next apply (Zag would hide immediately).
          this.beginExitAnimation()
        } else {
          this.cancelExitAnimation()
          this._exiting = false
        }
        const details: OpenChangeDetails = { open }
        emitDetail(this, 'open-change', details, this._onOpenChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'open') {
      this._open = booleanAttribute(value)
      this._openSet = value !== null
      this.updateMachineProps({ open: this._open })
    }
    if (name === 'default-open') this.updateMachineProps({ defaultOpen: value !== null })
    if (name === 'placement') {
      const placement = (value as DrawerPlacement) || 'right'
      this.placement = placement
      this.dataset.placement = placement
      this.updateMachineProps({ swipeDirection: drawerSwipeDirection(placement) })
      this.syncPlacementClasses()
    }
    if (name === 'size') {
      this.size = value || '360px'
      this.style.setProperty('--ui-drawer-size', this.size)
      this.syncSizeOnContent()
    }
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = drawer.connect(service, normalizeProps)
    this.classList.add('ui-drawer')
    this.syncPlacementClasses()
    this.syncSizeOnContent()

    const isOpen = Boolean(api.open)
    const visualOpen = isOpen || this._exiting
    const dataState = isOpen ? 'open' : 'closed'

    this.applyPart('[data-part="trigger"], h-drawer-trigger', api.getTriggerProps())

    const backdropProps = { ...api.getBackdropProps() } as Record<string, unknown>
    delete backdropProps.hidden
    this.applyPart('[data-part="backdrop"], h-drawer-backdrop', {
      ...backdropProps,
      class: 'ui-drawer__backdrop',
      'data-state': dataState,
      hidden: visualOpen ? false : true,
    })

    const positionerProps = { ...api.getPositionerProps() } as Record<string, unknown>
    delete positionerProps.hidden
    this.applyPart('[data-part="positioner"], h-drawer-positioner', {
      ...positionerProps,
      class: `ui-drawer__positioner ui-drawer__positioner--${this.placement}`,
      'data-placement': this.placement,
      'data-state': dataState,
      hidden: visualOpen ? false : true,
    })

    const contentProps = { ...api.getContentProps() } as Record<string, unknown>
    delete contentProps.hidden
    // Drop inline transform during CSS keyframe phase so slide anim is visible
    if (this._exiting || !isOpen) {
      const style = { ...((contentProps.style as Record<string, unknown>) || {}) }
      delete style.transform
      contentProps.style = style
    }
    this.applyPart('[data-part="content"], h-drawer-content', {
      ...contentProps,
      class: `ui-drawer__content ui-drawer__content--${this.placement}`,
      'data-placement': this.placement,
      'data-state': dataState,
      hidden: visualOpen ? false : true,
      style: {
        ...((contentProps.style as object) || {}),
        ['--ui-drawer-size']: this.size,
      },
    })

    this.applyPart('[data-part="title"], h-drawer-title', {
      ...api.getTitleProps(),
      class: 'ui-drawer__title',
    })
    this.applyPart('[data-part="description"], h-drawer-description', {
      ...api.getDescriptionProps(),
      class: 'ui-drawer__description',
    })
    this.applyPart('[data-part="close-trigger"], h-drawer-close', api.getCloseTriggerProps())

    // Re-bind exit listener after each apply if still exiting
    if (this._exiting) {
      this.attachExitListener()
    }
  }

  private beginExitAnimation() {
    if (this._exiting) return
    this._exiting = true
    // Next apply() will keep panel visible with data-state=closed
    queueMicrotask(() => {
      this.attachExitListener()
      // Force re-apply so data-state=closed lands for CSS
      this.apply()
    })
  }

  private cancelExitAnimation() {
    this._exitCleanup?.()
    this._exitCleanup = undefined
  }

  private attachExitListener() {
    this.cancelExitAnimation()
    const content = this.querySelector(
      '[data-part="content"], h-drawer-content',
    ) as HTMLElement | null
    if (!content) {
      this.finishExit()
      return
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== content) return
      // Only complete when an exit keyframe finishes
      const name = event.animationName || ''
      if (!name.includes('slide-out') && !name.includes('fade-out')) return
      this.finishExit(content)
    }

    content.addEventListener('animationend', onEnd)
    // Fallback if CSS animation is missing
    const fallback = window.setTimeout(() => this.finishExit(content), 320)

    this._exitCleanup = () => {
      content.removeEventListener('animationend', onEnd)
      window.clearTimeout(fallback)
    }
  }

  private finishExit(content?: HTMLElement | null) {
    if (!this._exiting) return
    this.cancelExitAnimation()
    this._exiting = false
    const el =
      content ??
      (this.querySelector('[data-part="content"], h-drawer-content') as HTMLElement | null)
    // Zag drawer machine waits for this custom event in `closing`
    el?.dispatchEvent(new CustomEvent('exitcomplete', { bubbles: false }))
    this.apply()
  }

  private syncPlacementClasses() {
    const placement = this.placement || 'right'
    this.dataset.placement = placement
    const positioner = this.querySelector('[data-part="positioner"], h-drawer-positioner')
    if (positioner) {
      positioner.className = `ui-drawer__positioner ui-drawer__positioner--${placement}`
    }
    const content = this.querySelector('[data-part="content"], h-drawer-content')
    if (content instanceof HTMLElement) {
      content.className = `ui-drawer__content ui-drawer__content--${placement}`
      content.dataset.placement = placement
    }
  }

  private syncSizeOnContent() {
    const content = this.querySelector('[data-part="content"], h-drawer-content')
    if (content instanceof HTMLElement) {
      content.style.setProperty('--ui-drawer-size', this.size || '360px')
    }
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const element = this.querySelector(selector)
    if (element) this.props(element, props)
  }

  disconnectedCallback() {
    this.cancelExitAnimation()
    this._exiting = false
    super.disconnectedCallback()
  }
}

export class HDrawerTrigger extends HTMLElement {}
export class HDrawerBackdrop extends HTMLElement {}
export class HDrawerPositioner extends HTMLElement {}
export class HDrawerContent extends HTMLElement {}
export class HDrawerTitle extends HTMLElement {}
export class HDrawerDescription extends HTMLElement {}
export class HDrawerClose extends HTMLElement {}

export type HDrawerProps = DrawerContract
defineOnce('h-drawer', HDrawer)
defineOnce('h-drawer-trigger', HDrawerTrigger)
defineOnce('h-drawer-backdrop', HDrawerBackdrop)
defineOnce('h-drawer-positioner', HDrawerPositioner)
defineOnce('h-drawer-content', HDrawerContent)
defineOnce('h-drawer-title', HDrawerTitle)
defineOnce('h-drawer-description', HDrawerDescription)
defineOnce('h-drawer-close', HDrawerClose)
