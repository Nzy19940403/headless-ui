import * as numberInput from '@zag-js/number-input'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type { NumberInputContract, ValueChangeDetails } from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

function pinCaretToEnd(input: HTMLInputElement | null | undefined) {
  if (!input || typeof document === 'undefined') return
  if (document.activeElement !== input) return
  const len = input.value.length
  try {
    input.setSelectionRange(len, len)
  } catch {
    /* ignore */
  }
}

/**
 * Component: HNumberInput
 * Mode: Generated anatomy
 * State owner: Zag number-input machine only
 *
 * Critical WC rules applied here (see docs/ai/wc-zag-spread-props-rule.txt):
 * - Do NOT cleanup spreadProps before every re-bind (breaks wheel/scrubber/events).
 * - Defer machine boot so host attributes are present.
 * - Controlled: only pass `value` when the attribute/property is set.
 */

function parseFormatOptions(raw: string | null): Intl.NumberFormatOptions | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as Intl.NumberFormatOptions
  } catch {
    return undefined
  }
}

function numAttr(el: Element, name: string): number | undefined {
  const raw = el.getAttribute(name)
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export class HNumberInput extends HTMLElement {
  static observedAttributes = [
    'value',
    'default-value',
    'min',
    'max',
    'step',
    'disabled',
    'readonly',
    'name',
    'label',
    'error',
    'helper-text',
    'format-options',
    'allow-mouse-wheel',
    'scrubber',
  ]

  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup
  private started = false
  private structureReady = false
  private readonly machineId = `h-number-${crypto.randomUUID()}`
  private _onValueChange?: DetailHandler<ValueChangeDetails>
  private _formatOptions?: Intl.NumberFormatOptions
  private caretFocusWired = false

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  /** Controlled value property (preferred for Set-from-JS). */
  get value(): string | number {
    if (this.hasAttribute('value')) return this.getAttribute('value') ?? ''
    return this.api()?.value ?? this.getAttribute('default-value') ?? ''
  }

  set value(next: string | number) {
    const v = next == null ? '' : String(next)
    if (this.getAttribute('value') === v) {
      // still push into machine (same string after user edit)
      this.pushControlledValue(v)
      return
    }
    this.setAttribute('value', v)
  }

  get formatOptions(): Intl.NumberFormatOptions | undefined {
    return this._formatOptions ?? parseFormatOptions(this.getAttribute('format-options'))
  }

  set formatOptions(value: Intl.NumberFormatOptions | undefined) {
    this._formatOptions = value
    if (this.service) {
      this.service.updateProps({ formatOptions: value })
      this.bindAll()
    }
  }

  /** Programmatic set — works controlled and uncontrolled. */
  setValue(next: string | number) {
    const v = next == null ? '' : String(next)
    if (this.hasAttribute('value') || this.service == null) {
      this.value = v
      return
    }
    const n = Number(v)
    if (Number.isFinite(n)) this.api()?.setValue(n)
    else this.service.updateProps({ defaultValue: v })
    this.bindAll()
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-number-input')
    if (this.started) return
    this.boot()
  }

  disconnectedCallback() {
    this.teardown()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return
    if (!this.service) return

    switch (name) {
      case 'value':
        // present → controlled; absent → uncontrolled (drop controlled prop)
        this.service.updateProps({
          value: newValue === null ? undefined : newValue,
        })
        this.bindAll()
        return
      case 'default-value':
        this.service.updateProps({ defaultValue: newValue ?? undefined })
        this.bindAll()
        return
      case 'min':
        this.service.updateProps({ min: newValue != null && newValue !== '' ? Number(newValue) : undefined })
        this.bindAll()
        return
      case 'max':
        this.service.updateProps({ max: newValue != null && newValue !== '' ? Number(newValue) : undefined })
        this.bindAll()
        return
      case 'step':
        this.service.updateProps({ step: newValue != null && newValue !== '' ? Number(newValue) : undefined })
        this.bindAll()
        return
      case 'disabled':
        this.service.updateProps({ disabled: newValue !== null })
        this.bindAll()
        return
      case 'readonly':
        this.service.updateProps({ readOnly: newValue !== null })
        this.bindAll()
        return
      case 'name':
        this.service.updateProps({ name: newValue ?? undefined })
        this.bindAll()
        return
      case 'format-options':
        this._formatOptions = undefined
        this.service.updateProps({ formatOptions: parseFormatOptions(newValue) })
        this.bindAll()
        return
      case 'allow-mouse-wheel':
        this.service.updateProps({ allowMouseWheel: newValue !== null })
        this.bindAll()
        return
      case 'scrubber':
        // Structure change — rebuild anatomy then rebind
        this.structureReady = false
        this.ensureStructure()
        this.bindAll()
        return
      case 'label':
      case 'helper-text':
      case 'error':
        if (name === 'error') {
          this.service.updateProps({ invalid: Boolean(newValue) })
        }
        this.syncMeta()
        this.bindAll()
        return
    }
  }

  private pushControlledValue(v: string) {
    if (!this.service) return
    this.service.updateProps({ value: v })
    this.bindAll()
  }

  private boot() {
    if (!this.isConnected || this.started) return
    this.started = true
    this.ensureStructure()
    this.service = this.createMachine()
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.bindAll())
    this.bindAll()
  }

  private teardown() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.service?.stop()
    this.service = undefined
    this.started = false
    this.structureReady = false
    this.caretFocusWired = false
  }

  private createMachine() {
    const controlled = this.hasAttribute('value') ? (this.getAttribute('value') ?? '') : undefined
    return new VanillaMachine(numberInput.machine, {
      id: this.machineId,
      value: controlled,
      defaultValue: this.getAttribute('default-value') ?? undefined,
      min: numAttr(this, 'min'),
      max: numAttr(this, 'max'),
      step: numAttr(this, 'step'),
      disabled: this.hasAttribute('disabled'),
      readOnly: this.hasAttribute('readonly'),
      name: this.getAttribute('name') ?? undefined,
      invalid: Boolean(this.getAttribute('error')),
      formatOptions: this.formatOptions,
      allowMouseWheel: this.hasAttribute('allow-mouse-wheel'),
      focusInputOnChange: true,
      onValueChange: ({ value }) => {
        emitDetail(this, 'value-change', { value } satisfies ValueChangeDetails, this._onValueChange)
        // Controlled hosts that only listen to events must re-set `value` themselves.
        // Uncontrolled: machine already owns store; just rebind.
        // bindAll() saves/restores caret internally when the input is focused.
        queueMicrotask(() => {
          this.bindAll()
        })
      },
    })
  }

  private api() {
    if (!this.service) return null
    return numberInput.connect(this.service.service, normalizeProps)
  }

  /**
   * Spread Zag props onto live anatomy.
   * Intentionally does NOT call previous spread cleanup — see wc-zag-spread-props-rule.
   */
  private bindAll() {
    const api = this.api()
    if (!api) return
    this.ensureStructure()
    this.syncMeta()

    const bind = (selector: string | null, props: Record<string, unknown>) => {
      const el = selector ? this.querySelector(selector) : this
      if (el) spreadProps(el, props)
    }

    bind(null, api.getRootProps() as Record<string, unknown>)
    bind('[data-part="label"]', api.getLabelProps() as Record<string, unknown>)
    bind('[data-part="control"]', api.getControlProps() as Record<string, unknown>)

    const scrubber = this.querySelector('[data-part="scrubber"]')
    if (scrubber) {
      spreadProps(scrubber, api.getScrubberProps() as Record<string, unknown>)
    }

    // Zag's machine syncs input value + cursor internally via syncInputElement
    // (setElementValue + restoreCursor with prefix/suffix matching).
    // When focused we skip value/defaultValue so spreadProps doesn't clobber the
    // machine's careful cursor restoration with an unconditional node.value write.
    const input = this.querySelector<HTMLInputElement>('[data-part="input"]')
    if (input) {
      const inputProps = api.getInputProps() as Record<string, unknown>
      if (document.activeElement === input) {
        const { value: _v, defaultValue: _dv, ...rest } = inputProps as Record<string, unknown>
        spreadProps(input, rest)
      } else {
        spreadProps(input, inputProps)
      }
    }

    bind('[data-part="increment-trigger"]', api.getIncrementTriggerProps() as Record<string, unknown>)
    bind('[data-part="decrement-trigger"]', api.getDecrementTriggerProps() as Record<string, unknown>)

    this.wireCaretFocus()
  }

  private wireCaretFocus() {
    if (this.caretFocusWired) return
    const input = this.querySelector<HTMLInputElement>('[data-part="input"]')
    if (!input) return
    this.caretFocusWired = true
    input.addEventListener('focus', () => {
      requestAnimationFrame(() => pinCaretToEnd(input))
    })
  }

  private ensureStructure() {
    if (this.structureReady && this.querySelector('[data-part="input"]')) {
      // Keep scrubber presence in sync if attribute flipped after first build
      const wantScrubber = this.hasAttribute('scrubber')
      const hasScrubber = Boolean(this.querySelector('[data-part="scrubber"]'))
      if (wantScrubber === hasScrubber) return
    }

    this.innerHTML = ''
    this.caretFocusWired = false

    const label = document.createElement('label')
    label.dataset.part = 'label'
    label.className = 'ui-field__label'

    const control = document.createElement('div')
    control.dataset.part = 'control'
    control.className = 'ui-number-input__control'

    if (this.hasAttribute('scrubber')) {
      const scrubber = document.createElement('div')
      scrubber.dataset.part = 'scrubber'
      scrubber.className = 'ui-number-input__scrubber'
      scrubber.setAttribute('aria-hidden', 'true')
      scrubber.textContent = '⇄'
      control.append(scrubber)
    }

    const input = document.createElement('input')
    input.dataset.part = 'input'
    input.className = 'ui-number-input__input'

    const triggers = document.createElement('div')
    triggers.className = 'ui-number-input__triggers'

    const inc = document.createElement('button')
    inc.type = 'button'
    inc.dataset.part = 'increment-trigger'
    inc.className = 'ui-number-input__trigger'
    inc.textContent = '+'

    const dec = document.createElement('button')
    dec.type = 'button'
    dec.dataset.part = 'decrement-trigger'
    dec.className = 'ui-number-input__trigger'
    dec.textContent = '−'

    triggers.append(inc, dec)
    control.append(input, triggers)

    const helper = document.createElement('span')
    helper.className = 'ui-field__helper'
    helper.dataset.part = 'helper'

    const error = document.createElement('span')
    error.className = 'ui-field__error'
    error.dataset.part = 'error'

    this.append(label, control, helper, error)
    this.structureReady = true
  }

  private syncMeta() {
    const label = this.querySelector<HTMLElement>('[data-part="label"]')
    const helper = this.querySelector<HTMLElement>('[data-part="helper"]')
    const errorEl = this.querySelector<HTMLElement>('[data-part="error"]')
    const labelText = this.getAttribute('label')
    if (label) {
      label.hidden = !labelText
      label.textContent = labelText ?? ''
    }
    const error = this.getAttribute('error')
    const helperText = this.getAttribute('helper-text')
    if (errorEl) {
      errorEl.hidden = !error
      errorEl.textContent = error ?? ''
    }
    if (helper) {
      helper.hidden = Boolean(error) || !helperText
      helper.textContent = helperText ?? ''
    }
  }
}

export type HNumberInputProps = NumberInputContract
defineOnce('h-number-input', HNumberInput)
