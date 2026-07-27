import * as accordion from '@zag-js/accordion'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { AccordionContract, AccordionValueChangeDetails } from '@demo/ui-core'
import { ZagRootElement, childrenOf, defineOnce, listAttribute, type Cleanup, emitDetail, asDetailHandler, type DetailHandler } from './compound'

export class HAccordion extends ZagRootElement<typeof accordion> {
  static observedAttributes = ['multiple', 'value', 'default-value']

  declare multiple: AccordionContract['multiple']
  declare value: AccordionContract['value']
  declare defaultValue: AccordionContract['defaultValue']

  /** Mirrors React `HAccordionProps.onValueChange`. */
  private _onValueChange?: DetailHandler<AccordionValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<AccordionValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  protected createMachine() {
    const props: Pick<AccordionContract<unknown>, 'multiple' | 'value' | 'defaultValue'> = {
      multiple: this.hasAttribute('multiple'),
      value: listAttribute(this.getAttribute('value')),
      defaultValue: listAttribute(this.getAttribute('default-value')),
    }
    return new VanillaMachine(accordion.machine, {
      id: `h-accordion-${crypto.randomUUID()}`,
      ...props,
      onValueChange: ({ value }) => {
        const details: AccordionValueChangeDetails = { value }
        emitDetail(this, 'value-change', details, this._onValueChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'multiple') this.updateMachineProps({ multiple: value !== null })
    if (name === 'value') this.updateMachineProps({ value: listAttribute(value) })
    if (name === 'default-value') this.updateMachineProps({ defaultValue: listAttribute(value) })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = accordion.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    childrenOf<HTMLElement>(this, '[data-value], h-accordion-item').forEach(item => {
      const value = item.getAttribute('data-value') ?? item.getAttribute('value')
      if (!value) return

      this.props(item, api.getItemProps({ value }))

      const trigger = item.querySelector('[data-part="trigger"], [data-part="item-trigger"], h-accordion-trigger')
      const content = item.querySelector('[data-part="content"], [data-part="item-content"], h-accordion-content')
      const indicator = item.querySelector('[data-part="indicator"], [data-part="item-indicator"], h-accordion-indicator')

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

export class HAccordionItem extends HTMLElement {}
export class HAccordionTrigger extends HTMLElement {}
export class HAccordionContent extends HTMLElement {}
export class HAccordionIndicator extends HTMLElement {}

defineOnce('h-accordion', HAccordion)
defineOnce('h-accordion-item', HAccordionItem)
defineOnce('h-accordion-trigger', HAccordionTrigger)
defineOnce('h-accordion-content', HAccordionContent)
defineOnce('h-accordion-indicator', HAccordionIndicator)
