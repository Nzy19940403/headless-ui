import * as checkbox from '@zag-js/checkbox'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, defineOnce, type Cleanup } from './compound'

/** Zag Checkbox renderer. The consumer supplies the anatomy and label text. */
export class UiCheckbox extends ZagRootElement<typeof checkbox> {
  protected createMachine() {
    return new VanillaMachine(checkbox.machine, {
      id: `ui-checkbox-${crypto.randomUUID()}`,
      onCheckedChange: ({ checked }) => {
        this.dispatchEvent(new CustomEvent('checked-change', { detail: { checked }, bubbles: true, composed: true }))
      },
    })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = checkbox.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="indicator"]', api.getIndicatorProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.applyPart('[data-part="hidden-input"]', api.getHiddenInputProps())
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

defineOnce('ui-checkbox', UiCheckbox)

