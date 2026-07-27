import * as radio from '@zag-js/radio-group'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type { SegmentItemContract, ValueChangeDetails } from '@demo/ui-core'
import { defineOnce, type Cleanup, emitDetail, asDetailHandler, upgradeDetailHandlerProperties, type DetailHandler } from './compound'

type Item = SegmentItemContract

function parseItems(raw: unknown): Item[] {
  if (Array.isArray(raw)) return raw as Item[]
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * Component: HSegmentGroup
 * Mode: Generated anatomy (Zag radio-group machine — same as Ark SegmentGroup)
 * State owner: Zag radio-group
 */
export class HSegmentGroup extends HTMLElement {
  static observedAttributes = ['value', 'default-value', 'disabled', 'name', 'label', 'items']

  private itemsCache: Item[] = []
  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup
  private bindCleanups: Cleanup[] = []
  private started = false
  private bootTimer: number | null = null
  private readonly groupId = `h-segment-${crypto.randomUUID()}`
  private _onValueChange?: DetailHandler<ValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  get items(): Item[] {
    return this.itemsCache
  }

  set items(value: Item[] | string) {
    this.itemsCache = parseItems(value)
    const json = JSON.stringify(this.itemsCache)
    if (this.getAttribute('items') !== json) this.setAttribute('items', json)
    else if (this.started) this.rebuild()
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-segment-group')
    if (this.bootTimer != null) return
    this.bootTimer = window.setTimeout(() => {
      this.bootTimer = null
      this.boot()
    }, 0)
  }

  disconnectedCallback() {
    if (this.bootTimer != null) {
      clearTimeout(this.bootTimer)
      this.bootTimer = null
    }
    this.teardown()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return
    if (name === 'items') {
      this.itemsCache = parseItems(newValue)
      if (this.started) this.rebuild()
      return
    }
    if (!this.service) return
    if (name === 'label') {
      this.syncLabel()
      return
    }
    if (name === 'value') {
      this.service.updateProps({ value: newValue ?? undefined })
      this.project()
      return
    }
    if (name === 'default-value') {
      this.service.updateProps({ defaultValue: newValue ?? undefined })
      this.project()
      return
    }
    if (name === 'disabled') {
      this.service.updateProps({ disabled: newValue !== null })
      this.rebuild()
      return
    }
    if (name === 'name') {
      this.service.updateProps({ name: newValue ?? this.groupId })
      this.rebuild()
    }
  }

  private boot() {
    if (!this.isConnected || this.started) return
    this.syncItems()
    this.started = true
    this.service = this.createMachine()
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.project())
    this.rebuild()
  }

  private teardown() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.bindCleanups.forEach(fn => fn())
    this.bindCleanups = []
    this.service?.stop()
    this.service = undefined
    this.started = false
  }

  private syncItems() {
    const fromAttr = parseItems(this.getAttribute('items'))
    if (fromAttr.length) this.itemsCache = fromAttr
  }

  private createMachine() {
    this.syncItems()
    const controlled = this.hasAttribute('value') ? this.getAttribute('value') ?? undefined : undefined
    return new VanillaMachine(radio.machine, {
      id: this.groupId,
      value: controlled,
      defaultValue: this.getAttribute('default-value') ?? undefined,
      disabled: this.hasAttribute('disabled'),
      name: this.getAttribute('name') ?? this.groupId,
      onValueChange: ({ value }) => {
        const details: ValueChangeDetails = { value: value ?? '' }
        emitDetail(this, 'value-change', details, this._onValueChange)
        this.project()
      },
    })
  }

  private api() {
    if (!this.service) return null
    return radio.connect(this.service.service, normalizeProps)
  }

  private rebuild() {
    this.renderMarkup()
    this.bindBehavior()
    this.project()
  }

  private renderMarkup() {
    const items = this.itemsCache
    const labelText = this.getAttribute('label')
    this.replaceChildren()

    if (labelText) {
      const label = document.createElement('span')
      label.dataset.part = 'label'
      label.className = 'ui-field__label'
      label.textContent = labelText
      this.append(label)
    }

    const list = document.createElement('div')
    list.className = 'ui-segment-group__items'
    list.dataset.part = 'items'

    for (const item of items) {
      const row = document.createElement('label')
      row.dataset.part = 'item'
      row.dataset.value = item.value
      row.className = 'ui-segment'
      const text = document.createElement('span')
      text.dataset.part = 'item-text'
      text.className = 'ui-segment__text'
      text.textContent = item.label
      const control = document.createElement('span')
      control.dataset.part = 'item-control'
      control.className = 'ui-segment__control'
      const input = document.createElement('input')
      input.dataset.part = 'item-hidden-input'
      row.append(text, control, input)
      list.append(row)
    }

    const indicator = document.createElement('div')
    indicator.dataset.part = 'indicator'
    indicator.className = 'ui-segment-group__indicator'
    list.append(indicator)
    this.append(list)
  }

  private syncLabel() {
    const labelText = this.getAttribute('label')
    let label = this.querySelector<HTMLElement>(':scope > [data-part="label"]')
    if (!labelText) {
      label?.remove()
      return
    }
    if (!label) {
      label = document.createElement('span')
      label.dataset.part = 'label'
      label.className = 'ui-field__label'
      this.prepend(label)
    }
    label.textContent = labelText
  }

  private bindBehavior() {
    const api = this.api()
    if (!api) return
    this.bindCleanups.forEach(fn => fn())
    this.bindCleanups = []
    const bind = (el: Element | null, props: Record<string, unknown>) => {
      if (!el) return
      this.bindCleanups.push(spreadProps(el, props))
    }
    bind(this, api.getRootProps() as Record<string, unknown>)
    const label = this.querySelector(':scope > [data-part="label"]')
    if (label) bind(label, api.getLabelProps() as Record<string, unknown>)
    this.querySelectorAll('[data-part="item"]').forEach(item => {
      const value = (item as HTMLElement).dataset.value
      if (!value) return
      bind(item, api.getItemProps({ value }) as Record<string, unknown>)
      bind(item.querySelector('[data-part="item-text"]'), api.getItemTextProps({ value }) as Record<string, unknown>)
      bind(item.querySelector('[data-part="item-control"]'), api.getItemControlProps({ value }) as Record<string, unknown>)
      bind(item.querySelector('[data-part="item-hidden-input"]'), api.getItemHiddenInputProps({ value }) as Record<string, unknown>)
    })
    const indicator = this.querySelector('[data-part="indicator"]')
    if (indicator && 'getIndicatorProps' in api) {
      bind(indicator, (api as any).getIndicatorProps() as Record<string, unknown>)
    }
  }

  private project() {
    const api = this.api()
    if (!api) return
    this.querySelectorAll('[data-part="item"]').forEach(item => {
      const value = (item as HTMLElement).dataset.value
      if (!value) return
      const state = api.getItemState({ value })
      const checked = state.checked
      item.setAttribute('data-state', checked ? 'checked' : 'unchecked')
      item.classList.toggle('is-checked', checked)
      const control = item.querySelector('[data-part="item-control"]')
      control?.setAttribute('data-state', checked ? 'checked' : 'unchecked')
    })
  }
}

defineOnce('h-segment-group', HSegmentGroup)
