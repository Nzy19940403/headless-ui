import * as dialog from '@zag-js/dialog'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { DialogContract, OpenChangeDetails } from '@demo/ui-core'
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
 * Light-DOM dialog over `@zag-js/dialog`.
 *
 * Dialog machine has no `closing`/`exitcomplete` (unlike drawer). We still run
 * CSS exit animation: keep nodes visible with data-state=closed, wait for
 * animationend, then allow Zag `hidden` again.
 */
export class HDialog extends ZagRootElement<typeof dialog> {
  static observedAttributes = ['open', 'default-open']

  declare defaultOpen: DialogContract['defaultOpen']

  private _open: boolean | undefined
  private _openSet = false
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

  protected createMachine() {
    const props: Pick<DialogContract, 'open' | 'defaultOpen'> = {
      open: this.open,
      defaultOpen: this.hasAttribute('default-open'),
    }
    return new VanillaMachine(dialog.machine, {
      id: `h-dialog-${crypto.randomUUID()}`,
      ...props,
      onOpenChange: ({ open }) => {
        if (!open) this.beginExitAnimation()
        else {
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
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    const api = dialog.connect(service, normalizeProps)
    this.classList.add('ui-dialog')

    const isOpen = Boolean(api.open)
    const visualOpen = isOpen || this._exiting
    const dataState = isOpen ? 'open' : 'closed'

    this.applyPart('[data-part="trigger"], h-dialog-trigger', api.getTriggerProps())

    const backdropProps = { ...api.getBackdropProps() } as Record<string, unknown>
    delete backdropProps.hidden
    this.applyPart('[data-part="backdrop"], h-dialog-backdrop', {
      ...backdropProps,
      class: 'ui-dialog__backdrop',
      'data-state': dataState,
      hidden: visualOpen ? false : true,
    })

    const positionerProps = { ...api.getPositionerProps() } as Record<string, unknown>
    delete positionerProps.hidden
    this.applyPart('[data-part="positioner"], h-dialog-positioner', {
      ...positionerProps,
      class: 'ui-dialog__positioner',
      'data-state': dataState,
      hidden: visualOpen ? false : true,
    })

    const contentProps = { ...api.getContentProps() } as Record<string, unknown>
    delete contentProps.hidden
    this.applyPart('[data-part="content"], h-dialog-content', {
      ...contentProps,
      class: 'dialog-content ui-dialog__content',
      'data-state': dataState,
      hidden: visualOpen ? false : true,
    })

    this.applyPart('[data-part="title"], h-dialog-title', {
      ...api.getTitleProps(),
      class: 'ui-dialog__title',
    })
    this.applyPart('[data-part="description"], h-dialog-description', {
      ...api.getDescriptionProps(),
      class: 'ui-dialog__description',
    })
    this.applyPart('[data-part="close-trigger"], h-dialog-close', api.getCloseTriggerProps())

    if (this._exiting) this.attachExitListener()
  }

  private beginExitAnimation() {
    if (this._exiting) return
    this._exiting = true
    queueMicrotask(() => {
      this.attachExitListener()
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
      '[data-part="content"], h-dialog-content',
    ) as HTMLElement | null
    if (!content) {
      this.finishExit()
      return
    }

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== content) return
      const name = event.animationName || ''
      if (!name.includes('dialog') && !name.includes('fade-out') && !name.includes('scale-out')) {
        return
      }
      this.finishExit()
    }

    content.addEventListener('animationend', onEnd)
    const fallback = window.setTimeout(() => this.finishExit(), 280)

    this._exitCleanup = () => {
      content.removeEventListener('animationend', onEnd)
      window.clearTimeout(fallback)
    }
  }

  private finishExit() {
    if (!this._exiting) return
    this.cancelExitAnimation()
    this._exiting = false
    this.apply()
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

export class HDialogTrigger extends HTMLElement {}
export class HDialogBackdrop extends HTMLElement {}
export class HDialogPositioner extends HTMLElement {}
export class HDialogContent extends HTMLElement {}
export class HDialogTitle extends HTMLElement {}
export class HDialogDescription extends HTMLElement {}
export class HDialogClose extends HTMLElement {}

defineOnce('h-dialog', HDialog)
defineOnce('h-dialog-trigger', HDialogTrigger)
defineOnce('h-dialog-backdrop', HDialogBackdrop)
defineOnce('h-dialog-positioner', HDialogPositioner)
defineOnce('h-dialog-content', HDialogContent)
defineOnce('h-dialog-title', HDialogTitle)
defineOnce('h-dialog-description', HDialogDescription)
defineOnce('h-dialog-close', HDialogClose)
