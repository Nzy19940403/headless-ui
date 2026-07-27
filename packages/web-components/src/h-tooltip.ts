import * as tooltip from '@zag-js/tooltip'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { OpenChangeDetails } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
} from './compound'

/**
 * Tooltip — anatomy aligned with React/Vue Ark Tooltip:
 *   trigger → positioner → content
 *
 * Public contract: content, open/default-open, disabled, positioning
 * Event: open-change → { open: boolean }
 *
 * Does not full-rebuild on every open tick beyond Zag spreadProps.
 */
export class HTooltip extends ZagRootElement<typeof tooltip> {
  static observedAttributes = ['content', 'open', 'default-open', 'disabled', 'positioning']

  private structureReady = false
  /** Mirrors React `HTooltipProps.onOpenChange`. */
  private _onOpenChange?: DetailHandler<OpenChangeDetails>

  get onOpenChange() {
    return this._onOpenChange
  }

  set onOpenChange(handler: DetailHandler<OpenChangeDetails> | null | undefined) {
    this._onOpenChange = asDetailHandler(handler)
  }

  protected createMachine() {
    const placement = (this.getAttribute('positioning') as 'top' | 'bottom' | 'left' | 'right') ?? 'top'
    return new VanillaMachine(tooltip.machine, {
      id: `h-tooltip-${crypto.randomUUID()}`,
      open: this.hasAttribute('open') ? true : undefined,
      defaultOpen: this.hasAttribute('default-open'),
      disabled: this.hasAttribute('disabled'),
      positioning: { placement },
      onOpenChange: ({ open }) => {
        const details: OpenChangeDetails = { open }
        emitDetail(this, 'open-change', details, this._onOpenChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'open') this.updateMachineProps({ open: value === null ? undefined : true })
    if (name === 'default-open') this.updateMachineProps({ defaultOpen: value !== null })
    if (name === 'disabled') this.updateMachineProps({ disabled: value !== null })
    if (name === 'positioning') this.updateMachineProps({ positioning: { placement: (value as any) ?? 'top' } })
    if (name === 'content') {
      const content = this.querySelector<HTMLElement>('[data-part="content"]')
      if (content && value != null) content.textContent = value
    }
  }

  /** Build trigger / positioner / content once; keep consumer children in trigger. */
  private ensureStructure() {
    if (this.structureReady && this.querySelector('[data-part="trigger"]') && this.querySelector('[data-part="positioner"]')) {
      return
    }

    let trigger = this.querySelector<HTMLElement>('[data-part="trigger"]')
    let positioner = this.querySelector<HTMLElement>('[data-part="positioner"]')
    let content = this.querySelector<HTMLElement>('[data-part="content"]')

    // Collect light-DOM children that are not parts we own.
    const orphans = Array.from(this.childNodes).filter(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())
      const el = node as HTMLElement
      const part = el.getAttribute?.('data-part')
      return part !== 'trigger' && part !== 'positioner' && part !== 'content'
    })

    if (!trigger) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.part = 'trigger'
      button.className = 'ui-tooltip-trigger'
      for (const node of orphans) button.append(node)
      trigger = button
      this.prepend(trigger)
    } else if (orphans.length) {
      for (const node of orphans) trigger.append(node)
    }

    if (!positioner) {
      positioner = document.createElement('div')
      positioner.dataset.part = 'positioner'
      positioner.className = 'ui-tooltip__positioner'
      this.append(positioner)
    }

    if (!content) {
      content = document.createElement('div')
      content.dataset.part = 'content'
      content.className = 'ui-tooltip'
      positioner.append(content)
    } else if (content.parentElement !== positioner) {
      positioner.append(content)
    }

    content.classList.add('ui-tooltip')
    const text = this.getAttribute('content')
    if (text != null) content.textContent = text

    this.structureReady = true
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    this.ensureStructure()
    const api = tooltip.connect(service, normalizeProps)

    const trigger = this.querySelector('[data-part="trigger"]')
    const positioner = this.querySelector('[data-part="positioner"]')
    const content = this.querySelector('[data-part="content"]')

    if (trigger) this.props(trigger, api.getTriggerProps())
    if (positioner) this.props(positioner, api.getPositionerProps())
    if (content) this.props(content, api.getContentProps())
  }
}

defineOnce('h-tooltip', HTooltip)
