import * as tabs from '@zag-js/tabs'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, childrenOf, defineOnce, type Cleanup } from './compound'

export class UiTabs extends ZagRootElement<typeof tabs> {
  protected createMachine() {
    return new VanillaMachine(tabs.machine, {
      id: `ui-tabs-${crypto.randomUUID()}`,
      defaultValue: this.getAttribute('default-value') ?? undefined,
    })
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    const api = tabs.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    const list = this.querySelector('[data-part="list"], ui-tabs-list')
    if (list) this.props(list, api.getListProps())
    childrenOf<HTMLElement>(this, '[data-part="trigger"], ui-tabs-trigger').forEach(trigger => {
      const value = trigger.getAttribute('data-value') ?? trigger.getAttribute('value')
      if (value) this.props(trigger, api.getTriggerProps({ value }))
    })
    childrenOf<HTMLElement>(this, '[data-part="content"], ui-tabs-content').forEach(content => {
      const value = content.getAttribute('data-value') ?? content.getAttribute('value')
      if (value) this.props(content, api.getContentProps({ value }))
    })
  }
}

export class UiTabsList extends HTMLElement {}
export class UiTabsTrigger extends HTMLElement {}
export class UiTabsContent extends HTMLElement {}

defineOnce('ui-tabs', UiTabs)
defineOnce('ui-tabs-list', UiTabsList)
defineOnce('ui-tabs-trigger', UiTabsTrigger)
defineOnce('ui-tabs-content', UiTabsContent)
