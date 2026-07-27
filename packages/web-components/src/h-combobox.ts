import { LitElement, html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import * as combobox from '@zag-js/combobox'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type { ComboboxContract, ComboboxItemContract, ValueChangeDetails } from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

type Item = ComboboxItemContract

const itemsConverter = {
  fromAttribute(value: string | null): Item[] {
    if (!value) return []
    try {
      return JSON.parse(value) as Item[]
    } catch {
      return []
    }
  },
  toAttribute(value: Item[]): string {
    return JSON.stringify(value ?? [])
  },
}

/**
 * Lit + Zag Combobox (single select).
 * Machine ticks never call requestUpdate(); only items/label/placeholder re-render.
 */
export class HCombobox extends LitElement {
  static properties = {
    items: { type: Array, converter: itemsConverter },
    value: { type: String },
    defaultValue: { type: String, attribute: 'default-value' },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
    label: { type: String },
  }

  declare items: Item[]
  declare value: string | undefined
  declare defaultValue: string | undefined
  declare placeholder: string
  declare disabled: boolean
  declare name: string | undefined
  declare label: string | undefined

  private _onValueChange?: DetailHandler<ValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup
  private cleanups: Cleanup[] = []
  private lastOpen = false
  private lastHighlighted: string | null = null

  constructor() {
    super()
    this.items = []
    this.placeholder = 'Search…'
    this.disabled = false
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-combobox')
    this.startMachine()
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.stopMachine()
    super.disconnectedCallback()
  }

  protected shouldUpdate(changed: Map<PropertyKey, unknown>) {
    if (!this.service) return true
    let updatedMachine = false
    if (changed.has('items')) {
      this.service.updateProps({ collection: this.makeCollection() })
      updatedMachine = true
    }
    if (changed.has('value')) {
      this.service.updateProps({ value: this.value ? [this.value] : [] })
      updatedMachine = true
    }
    if (changed.has('defaultValue')) {
      this.service.updateProps({ defaultValue: this.defaultValue ? [this.defaultValue] : [] })
      updatedMachine = true
    }
    if (changed.has('disabled')) {
      this.service.updateProps({ disabled: this.disabled })
      updatedMachine = true
    }
    if (changed.has('name')) {
      this.service.updateProps({ name: this.name })
      updatedMachine = true
    }
    const shouldRender = changed.has('items') || changed.has('label') || changed.has('placeholder')
    if (updatedMachine && !shouldRender) this.syncFromMachine(true)
    return shouldRender
  }

  protected firstUpdated() {
    this.bindAllZagProps()
    this.syncFromMachine(true)
  }

  protected updated() {
    this.bindAllZagProps()
    this.syncFromMachine(true)
  }

  private makeCollection() {
    return combobox.collection({
      items: this.items ?? [],
      itemToValue: (item: Item) => item.value,
      itemToString: (item: Item) => item.label,
      isItemDisabled: (item: Item) => Boolean(item.disabled),
    })
  }

  private startMachine() {
    if (this.service) return
    this.service = new VanillaMachine(combobox.machine, {
      id: `h-combobox-${crypto.randomUUID()}`,
      collection: this.makeCollection(),
      value: this.value ? [this.value] : undefined,
      defaultValue: this.defaultValue ? [this.defaultValue] : undefined,
      disabled: this.disabled,
      name: this.name,
      onValueChange: details => {
        const value = details.value[0] ?? ''
        if (this.value !== value) this.value = value
        emitDetail(this, 'value-change', { value } satisfies ValueChangeDetails, this._onValueChange)
        this.syncFromMachine(true)
      },
    })
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.syncFromMachine(false))
  }

  private stopMachine() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    this.service?.stop()
    this.service = undefined
  }

  private getApi() {
    if (!this.service) return null
    return combobox.connect(this.service.service, normalizeProps)
  }

  private syncFromMachine(force: boolean) {
    const api = this.getApi()
    if (!api) return
    const open = api.open
    const highlighted = api.highlightedValue

    if (force || open !== this.lastOpen) {
      this.lastOpen = open
      this.lastHighlighted = highlighted
      this.bindAllZagProps()
      this.patchAllItemStates(api)
      return
    }

    if (highlighted !== this.lastHighlighted) {
      const previous = this.lastHighlighted
      this.lastHighlighted = highlighted
      this.patchItemStates(api, previous, highlighted)
    }
  }

  private patchAllItemStates(api: ReturnType<typeof combobox.connect>) {
    for (const item of this.items ?? []) this.patchItemState(api, item)
  }

  private patchItemStates(api: ReturnType<typeof combobox.connect>, ...values: Array<string | null | undefined>) {
    for (const value of new Set(values.filter((v): v is string => Boolean(v)))) {
      const item = this.items.find(i => i.value === value)
      if (item) this.patchItemState(api, item)
    }
  }

  private patchItemState(api: ReturnType<typeof combobox.connect>, item: Item) {
    const node = this.querySelector<HTMLElement>(`[data-part="item"][data-value="${CSS.escape(item.value)}"]`)
    if (!node) return
    const state = api.getItemState({ item })
    if (state.highlighted) node.setAttribute('data-highlighted', '')
    else node.removeAttribute('data-highlighted')
    node.setAttribute('data-state', state.selected ? 'checked' : 'unchecked')
  }

  private bindAllZagProps() {
    const api = this.getApi()
    if (!api) return
    const bind = (el: Element | null, props: Record<string, unknown>) => {
      if (!el) return
      spreadProps(el, props)
    }
    bind(this, api.getRootProps())
    bind(this.querySelector('[data-part="label"]'), api.getLabelProps())
    bind(this.querySelector('[data-part="control"]'), api.getControlProps())
    bind(this.querySelector('[data-part="input"]'), api.getInputProps())
    bind(this.querySelector('[data-part="trigger"]'), api.getTriggerProps())
    bind(this.querySelector('[data-part="positioner"]'), api.getPositionerProps())
    bind(this.querySelector('[data-part="content"]'), api.getContentProps())
    for (const item of this.items ?? []) {
      const node = this.querySelector(`[data-part="item"][data-value="${CSS.escape(item.value)}"]`)
      if (!node) continue
      bind(node, api.getItemProps({ item }))
      bind(node.querySelector('[data-part="item-text"]'), api.getItemTextProps({ item }))
      bind(node.querySelector('[data-part="item-indicator"]'), api.getItemIndicatorProps({ item }))
    }
  }

  protected render() {
    const items = this.items ?? []
    return html`
      ${this.label ? html`<label data-part="label" class="ui-field__label">${this.label}</label>` : nothing}
      <div data-part="control" class="ui-combobox__control">
        <input data-part="input" class="ui-combobox__input" placeholder=${this.placeholder} />
        <button type="button" data-part="trigger" class="ui-combobox__trigger">▾</button>
      </div>
      <div data-part="positioner" class="ui-combobox__positioner">
        <div data-part="content" class="ui-combobox__content">
          ${repeat(
            items,
            item => item.value,
            item => html`
              <div data-part="item" data-value=${item.value} class="ui-combobox__item">
                <span data-part="item-text">${item.label}</span>
                <span data-part="item-indicator" class="ui-combobox__item-indicator">✓</span>
              </div>
            `,
          )}
        </div>
      </div>
    `
  }
}

export type HComboboxProps = ComboboxContract
defineOnce('h-combobox', HCombobox)
