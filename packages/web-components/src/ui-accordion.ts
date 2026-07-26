import * as accordion from '@zag-js/accordion'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, childrenOf, defineOnce, type Cleanup } from './compound'

export class UiAccordion extends ZagRootElement<typeof accordion> {
  protected createMachine() {
    return new VanillaMachine(accordion.machine, {
      id: `ui-accordion-${crypto.randomUUID()}`,
      multiple: this.hasAttribute('multiple'),
    })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = accordion.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    childrenOf<HTMLElement>(this, '[data-value], ui-accordion-item').forEach(item => {
      const value = item.getAttribute('data-value') ?? item.getAttribute('value')
      if (!value) return

      this.props(item, api.getItemProps({ value }))

      const trigger = item.querySelector('[data-part="trigger"], [data-part="item-trigger"], ui-accordion-trigger')
      const content = item.querySelector('[data-part="content"], [data-part="item-content"], ui-accordion-content')
      const indicator = item.querySelector('[data-part="indicator"], [data-part="item-indicator"], ui-accordion-indicator')

      if (trigger) {
        this.props(trigger, api.getItemTriggerProps({ value }))
        this.bindTrigger(trigger, value, api, cleanup)
      }
      if (content) this.props(content, api.getItemContentProps({ value }))
      if (indicator) this.props(indicator, api.getItemIndicatorProps({ value }))
    })
  }

  private bindTrigger(trigger: Element, value: string, api: any, cleanup: Cleanup[]) {
    const handleClick = (event: Event) => {
      event.preventDefault()
      const currentValue = api.value as string[]
      const expanded = currentValue.includes(value)
      const nextValue = expanded
        ? currentValue.filter(item => item !== value)
        : this.hasAttribute('multiple')
          ? [...currentValue, value]
          : [value]
      api.setValue(nextValue)
    }
    trigger.addEventListener('click', handleClick)
    cleanup.push(() => trigger.removeEventListener('click', handleClick))
  }
}

export class UiAccordionItem extends HTMLElement {}
export class UiAccordionTrigger extends HTMLElement {}
export class UiAccordionContent extends HTMLElement {}
export class UiAccordionIndicator extends HTMLElement {}

defineOnce('ui-accordion', UiAccordion)
defineOnce('ui-accordion-item', UiAccordionItem)
defineOnce('ui-accordion-trigger', UiAccordionTrigger)
defineOnce('ui-accordion-content', UiAccordionContent)
defineOnce('ui-accordion-indicator', UiAccordionIndicator)

