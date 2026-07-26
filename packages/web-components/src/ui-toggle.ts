import * as zagSwitch from '@zag-js/switch'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, defineOnce, type Cleanup } from './compound'

/** Zag Switch renderer. It never replaces consumer-owned children or text. */
export class UiToggle extends ZagRootElement<typeof zagSwitch> {
  protected createMachine() {
    return new VanillaMachine(zagSwitch.machine, {
      id: `ui-toggle-${crypto.randomUUID()}`,
      onCheckedChange: ({ checked }) => {
        this.dispatchEvent(new CustomEvent('checked-change', { detail: { checked }, bubbles: true, composed: true }))
      },
    })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = zagSwitch.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="hidden-input"]', api.getHiddenInputProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="thumb"]', api.getThumbProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.bindToggle('[data-part="control"], [data-part="label"]', api.toggleChecked, cleanup)
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const element = this.querySelector(selector)
    if (element) this.props(element, props)
  }

  private bindToggle(selector: string, toggle: () => void, cleanup: Cleanup[]) {
    this.querySelectorAll(selector).forEach(element => {
      const handleClick = (event: Event) => {
        event.preventDefault()
        toggle()
      }
      element.addEventListener('click', handleClick)
      cleanup.push(() => element.removeEventListener('click', handleClick))
    })
  }
}

defineOnce('ui-toggle', UiToggle)

