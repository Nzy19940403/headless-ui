import * as radio from '@zag-js/radio-group'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type { RadioItemContract, ValueChangeDetails } from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

type Item = RadioItemContract

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
 * HRadioGroup (generated anatomy)
 *
 * State owner: Zag machine only.
 * - Structure changes (items) → rebuild markup + bind Zag props once
 * - Machine ticks → project state to data-state / aria / input.checked
 * - No parallel selectedMap / manual toggle
 */
export class HRadioGroup extends HTMLElement {
  static observedAttributes = ['value', 'default-value', 'disabled', 'name', 'label', 'items']

  private itemsCache: Item[] = []
  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup
  private bindCleanups: Cleanup[] = []
  private started = false
  private bootTimer: number | null = null
  private readonly groupId = `h-radio-${crypto.randomUUID()}`
  /** Mirrors React `HRadioGroupProps.onValueChange` only (React has this prop). */
  private _onValueChange?: DetailHandler<ValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-radio-group')
    if (this.bootTimer != null) return
    // Allow host (React) to assign attributes first
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
      // controlled only when attribute present
      this.service.updateProps({ value: newValue ?? undefined })
      this.project()
      return
    }
    if (name === 'default-value') {
      // never map default → value
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

  get items(): Item[] {
    return this.itemsCache
  }

  set items(value: Item[] | string) {
    this.itemsCache = parseItems(value)
    const json = JSON.stringify(this.itemsCache)
    if (this.getAttribute('items') !== json) this.setAttribute('items', json)
    else if (this.started) this.rebuild()
  }

  private boot() {
    if (!this.isConnected || this.started) return
    this.syncItems()
    this.started = true
    this.service = this.createMachine()
    this.service.start()
    // Machine is the only state owner; every tick only projects to DOM.
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
    const fallback = this.getAttribute('default-value') ?? undefined
    return new VanillaMachine(radio.machine, {
      id: this.groupId,
      // Strict split: controlled value only if value attr exists
      value: controlled,
      defaultValue: fallback,
      disabled: this.hasAttribute('disabled'),
      name: this.getAttribute('name') ?? this.groupId,
      onValueChange: ({ value }) => {
        const details: ValueChangeDetails = { value: value ?? '' }
        emitDetail(this, 'value-change', details, this._onValueChange)
        // Project immediately (don't wait solely on store notify ordering)
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

    if (!items.length) return

    const list = document.createElement('div')
    list.className = 'ui-radio-group__items'

    for (const item of items) {
      const row = document.createElement('label')
      row.dataset.part = 'item'
      row.dataset.value = item.value
      row.className = 'ui-radio'
      row.setAttribute('data-state', 'unchecked')

      const control = document.createElement('span')
      control.dataset.part = 'item-control'
      control.className = 'ui-radio__control'
      control.setAttribute('data-state', 'unchecked')

      const text = document.createElement('span')
      text.dataset.part = 'item-text'
      text.className = 'ui-radio__label'
      text.textContent = item.label

      const input = document.createElement('input')
      input.dataset.part = 'item-hidden-input'
      // type/name/id/checked come from Zag getItemHiddenInputProps

      row.append(control, text, input)
      list.append(row)
    }

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

  /** Bind Zag behavior once per structure. */
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

    this.querySelectorAll<HTMLElement>('[data-part="item"]').forEach(itemEl => {
      const value = itemEl.dataset.value
      if (!value) return
      const item = this.itemsCache.find(i => i.value === value)
      const key = { value, disabled: item?.disabled }

      bind(itemEl, api.getItemProps(key) as Record<string, unknown>)
      bind(itemEl.querySelector('[data-part="item-control"]'), api.getItemControlProps(key) as Record<string, unknown>)
      bind(itemEl.querySelector('[data-part="item-text"]'), api.getItemTextProps(key) as Record<string, unknown>)
      bind(itemEl.querySelector('[data-part="item-hidden-input"]'), api.getItemHiddenInputProps(key) as Record<string, unknown>)
    })
  }

  /**
   * Project Zag state → DOM.
   * Always overwrites data-state on item + control so checked styles follow value.
   */
  private project() {
    const api = this.api()
    if (!api) return

    this.querySelectorAll<HTMLElement>('[data-part="item"]').forEach(itemEl => {
      const value = itemEl.dataset.value
      if (!value) return
      const item = this.itemsCache.find(i => i.value === value)
      const state = api.getItemState({ value, disabled: item?.disabled })
      const dataState = state.checked ? 'checked' : 'unchecked'

      // Force attribute (not only dataset) so CSS [data-state=checked] always matches truth
      itemEl.setAttribute('data-state', dataState)
      itemEl.setAttribute('aria-checked', state.checked ? 'true' : 'false')
      itemEl.toggleAttribute('data-disabled', Boolean(state.disabled))
      itemEl.toggleAttribute('data-focus', Boolean(state.focused))
      itemEl.toggleAttribute('data-hover', Boolean(state.hovered))

      const control = itemEl.querySelector<HTMLElement>('[data-part="item-control"]')
      if (control) {
        control.setAttribute('data-state', dataState)
      }

      const text = itemEl.querySelector<HTMLElement>('[data-part="item-text"]')
      if (text) {
        text.setAttribute('data-state', dataState)
      }

      const input = itemEl.querySelector<HTMLInputElement>('[data-part="item-hidden-input"]')
      if (input) {
        // Zag spreads defaultChecked once; keep live checked in sync for a11y/forms only
        input.checked = state.checked
      }
    })
  }
}

defineOnce('h-radio-group', HRadioGroup)
