import * as tabs from '@zag-js/tabs'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { TabsContract, ValueChangeDetails } from '@demo/ui-core'
import { ZagRootElement, childrenOf, defineOnce, type Cleanup, emitDetail, asDetailHandler, type DetailHandler } from './compound'

export class HTabs extends ZagRootElement<typeof tabs> {
  static observedAttributes = ['value', 'default-value']

  declare value: TabsContract['value']
  declare defaultValue: TabsContract['defaultValue']

  /** Mirrors React `HTabsProps.onValueChange`. */
  private _onValueChange?: DetailHandler<ValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  protected createMachine() {
    const props: Pick<TabsContract<unknown>, 'value' | 'defaultValue'> = {
      value: this.getAttribute('value') ?? undefined,
      defaultValue: this.getAttribute('default-value') ?? undefined,
    }
    return new VanillaMachine(tabs.machine, {
      id: `h-tabs-${crypto.randomUUID()}`,
      ...props,
      onValueChange: ({ value }) => {
        const details: ValueChangeDetails = { value }
        emitDetail(this, 'value-change', details, this._onValueChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'value') this.updateMachineProps({ value: value ?? undefined })
    if (name === 'default-value') this.updateMachineProps({ defaultValue: value ?? undefined })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = tabs.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    const list = this.querySelector('[data-part="list"], h-tabs-list')
    if (list) this.props(list, api.getListProps())
    childrenOf<HTMLElement>(this, '[data-part="trigger"], h-tabs-trigger').forEach(trigger => {
      const value = trigger.getAttribute('data-value') ?? trigger.getAttribute('value')
      if (value) this.props(trigger, api.getTriggerProps({ value }))
    })
    childrenOf<HTMLElement>(this, '[data-part="content"], h-tabs-content').forEach(content => {
      const value = content.getAttribute('data-value') ?? content.getAttribute('value')
      if (value) this.props(content, api.getContentProps({ value }))
    })
  }
}

export class HTabsList extends HTMLElement {}
export class HTabsTrigger extends HTMLElement {}
export class HTabsContent extends HTMLElement {}

defineOnce('h-tabs', HTabs)
defineOnce('h-tabs-list', HTabsList)
defineOnce('h-tabs-trigger', HTabsTrigger)
defineOnce('h-tabs-content', HTabsContent)
