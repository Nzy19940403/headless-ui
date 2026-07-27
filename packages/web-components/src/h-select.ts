import { LitElement, html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import * as select from '@zag-js/select'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type { SelectContract, SelectItemContract, ValueChangeDetails } from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

type Item = SelectItemContract

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
 * Lit + Zag Select.
 *
 * Render policy:
 * - Lit `render()` only depends on public *data* props (items/label/placeholder/…).
 * - Zag machine ticks (hover highlight, open/close) NEVER call `requestUpdate()`.
 * - Hover → patch `data-highlighted` only.
 * - Open/value structure changes → re-bind Zag props without re-rendering the tree.
 */
export class HSelect extends LitElement {
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

  /** Mirrors React `HSelectProps.onValueChange`. */
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

  /** Last machine snapshot used to skip useless work. */
  private lastOpen = false
  private lastHighlighted: string | null = null
  private lastSelected: string | null = null
  private lastValueAsString = ''

  constructor() {
    super()
    this.items = []
    this.placeholder = 'Select…'
    this.disabled = false
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-select')
    this.startMachine()
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.stopMachine()
    super.disconnectedCallback()
  }

  /**
   * Public props changed → update Zag first.
   *
   * Only structural/display data should reach Lit render(). State-like props
   * such as value/disabled/name are patched through Zag so they don't rebuild
   * the option tree.
   */
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
    if (updatedMachine && !shouldRender) {
      this.syncFromMachine(true)
    }

    return shouldRender
  }

  protected firstUpdated() {
    this.bindAllZagProps()
    this.syncFromMachine(true)
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    // Only when public props drove a real Lit render (items/label/…).
    if (changed.size === 0) return
    this.bindAllZagProps()
    this.syncFromMachine(true)
  }

  private makeCollection() {
    return select.collection({
      items: this.items ?? [],
      itemToValue: (item: Item) => item.value,
      itemToString: (item: Item) => item.label,
      isItemDisabled: (item: Item) => Boolean(item.disabled),
    })
  }

  private startMachine() {
    if (this.service) return
    this.service = new VanillaMachine(select.machine, {
      id: `h-select-${crypto.randomUUID()}`,
      collection: this.makeCollection(),
      value: this.value ? [this.value] : undefined,
      defaultValue: this.defaultValue ? [this.defaultValue] : undefined,
      disabled: this.disabled,
      name: this.name,
      onValueChange: details => {
        const value = details.value[0] ?? ''
        // Avoid Lit update when data did not change.
        if (this.value !== value) {
          this.value = value
        }
        const payload: ValueChangeDetails = { value }
        emitDetail(this, 'value-change', payload, this._onValueChange)
        this.syncFromMachine(true)
      },
    })
    this.service.start()
    // Machine ticks: patch only. Never requestUpdate() here.
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
    return select.connect(this.service.service, normalizeProps)
  }

  /**
   * @param force full re-bind (after Lit render / selection). Otherwise
   *              only patch what actually changed (hover highlight, open).
   */
  private syncFromMachine(force: boolean) {
    const api = this.getApi()
    if (!api) return

    const open = api.open
    const highlighted = api.highlightedValue
    const selected = this.selectedValue(api)
    const valueText = api.valueAsString || this.placeholder

    if (force) {
      this.lastOpen = open
      this.lastHighlighted = highlighted
      this.lastSelected = selected
      this.lastValueAsString = valueText
      this.bindAllZagProps()
      this.writeValueText(valueText)
      this.patchAllItemStates(api)
      return
    }

    // open/close: re-apply positioner/content props (still no Lit re-render)
    if (open !== this.lastOpen) {
      this.lastOpen = open
      this.lastHighlighted = highlighted
      this.lastSelected = selected
      this.bindAllZagProps()
      this.writeValueText(valueText)
      this.patchAllItemStates(api)
      return
    }

    // hover highlight only: patch previous + next nodes, no list walk.
    if (highlighted !== this.lastHighlighted) {
      const previous = this.lastHighlighted
      this.lastHighlighted = highlighted
      this.patchItemStates(api, previous, highlighted)
    }

    if (selected !== this.lastSelected) {
      const previous = this.lastSelected
      this.lastSelected = selected
      this.patchItemStates(api, previous, selected)
    }

    if (valueText !== this.lastValueAsString) {
      this.lastValueAsString = valueText
      this.writeValueText(valueText)
    }
  }

  private writeValueText(text: string) {
    const el = this.querySelector<HTMLElement>('[data-part="value-text"]')
    if (el && el.textContent !== text) el.textContent = text
  }

  private selectedValue(api: ReturnType<typeof select.connect>) {
    const value = (api as unknown as { value?: string[] }).value
    return Array.isArray(value) ? value[0] ?? null : null
  }

  /** Full item state sync after render/open; not used for hover ticks. */
  private patchAllItemStates(api: ReturnType<typeof select.connect>) {
    for (const item of this.items ?? []) {
      this.patchItemState(api, item)
    }
  }

  /** Only patch nodes whose state could have changed. */
  private patchItemStates(api: ReturnType<typeof select.connect>, ...values: Array<string | null | undefined>) {
    const uniqueValues = new Set(values.filter((value): value is string => Boolean(value)))
    for (const value of uniqueValues) {
      const item = this.items.find(item => item.value === value)
      if (item) this.patchItemState(api, item)
    }
  }

  private patchItemState(api: ReturnType<typeof select.connect>, item: Item) {
    const node = this.querySelector<HTMLElement>(
      `[data-part="item"][data-value="${CSS.escape(item.value)}"]`,
    )
    if (!node) return

    const state = api.getItemState({ item })
    if (state.highlighted) node.setAttribute('data-highlighted', '')
    else node.removeAttribute('data-highlighted')

    node.setAttribute('data-state', state.selected ? 'checked' : 'unchecked')

    const indicator = node.querySelector<HTMLElement>('[data-part="item-indicator"]')
    if (indicator) indicator.style.opacity = state.selected ? '1' : '0'
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
    bind(this.querySelector('[data-part="trigger"]'), api.getTriggerProps())
    bind(this.querySelector('[data-part="value-text"]'), api.getValueTextProps())
    bind(this.querySelector('[data-part="indicator"]'), api.getIndicatorProps())
    bind(this.querySelector('[data-part="positioner"]'), api.getPositionerProps())
    bind(this.querySelector('[data-part="content"]'), api.getContentProps())
    bind(this.querySelector('[data-part="hidden-select"]'), api.getHiddenSelectProps())

    for (const item of this.items ?? []) {
      const node = this.querySelector(`[data-part="item"][data-value="${CSS.escape(item.value)}"]`)
      if (!node) continue
      bind(node, api.getItemProps({ item }))
      bind(node.querySelector('[data-part="item-text"]'), api.getItemTextProps({ item }))
      bind(node.querySelector('[data-part="item-indicator"]'), api.getItemIndicatorProps({ item }))
    }
  }

  protected render() {
    // Anatomy from public DATA only — never open/highlight state.
    const items = this.items ?? []

    return html`
      ${this.label
        ? html`<label data-part="label" class="ui-field__label">${this.label}</label>`
        : nothing}
      <div data-part="control" class="ui-select__control">
        <button type="button" data-part="trigger" class="ui-select__trigger">
          <span data-part="value-text">${this.placeholder}</span>
          <span data-part="indicator" class="ui-select__indicator">▾</span>
        </button>
      </div>
      <div data-part="positioner" class="ui-select__positioner">
        <div data-part="content" class="ui-select__content">
          ${repeat(
            items,
            item => item.value,
            item => html`
              <div data-part="item" data-value=${item.value} class="ui-select__item">
                <span data-part="item-text">${item.label}</span>
                <span data-part="item-indicator" class="ui-select__item-indicator">✓</span>
              </div>
            `,
          )}
        </div>
      </div>
      <select data-part="hidden-select" hidden></select>
    `
  }
}

export type HSelectProps = SelectContract

defineOnce('h-select', HSelect)
