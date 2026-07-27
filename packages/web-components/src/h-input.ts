import type { InputContract, ValueChangeDetails } from '@demo/ui-core'
import { defineOnce, emitDetail, asDetailHandler, upgradeDetailHandlerProperties, type DetailHandler } from './compound'

/** Styled input field. Light DOM optional; otherwise renders label + input. */
export class HInput extends HTMLElement {
  static observedAttributes = ['label', 'placeholder', 'value', 'default-value', 'type', 'disabled', 'required', 'error', 'helper-text', 'size', 'name', 'readonly']

  private input?: HTMLInputElement
  private labelEl?: HTMLLabelElement
  private helperEl?: HTMLElement
  private errorEl?: HTMLElement

  /** Mirrors React `HInputProps.onValueChange`. */
  private _onValueChange?: DetailHandler<ValueChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-field')
    this.ensureStructure()
    this.sync()
    this.input?.addEventListener('input', this.onInput)
  }

  disconnectedCallback() {
    this.input?.removeEventListener('input', this.onInput)
  }

  attributeChangedCallback() {
    this.sync()
  }

  private onInput = () => {
    const value = this.input?.value ?? ''
    emitDetail(this, 'value-change', { value } satisfies ValueChangeDetails, this._onValueChange)
  }

  private ensureStructure() {
    if (!this.querySelector('.ui-input')) {
      this.innerHTML = ''
      this.labelEl = document.createElement('label')
      this.labelEl.className = 'ui-field__label'
      this.input = document.createElement('input')
      this.input.className = 'ui-input'
      this.helperEl = document.createElement('span')
      this.helperEl.className = 'ui-field__helper'
      this.errorEl = document.createElement('span')
      this.errorEl.className = 'ui-field__error'
      this.append(this.labelEl, this.input, this.helperEl, this.errorEl)
    } else {
      this.labelEl = this.querySelector('.ui-field__label') as HTMLLabelElement
      this.input = this.querySelector('.ui-input') as HTMLInputElement
      this.helperEl = this.querySelector('.ui-field__helper') as HTMLElement
      this.errorEl = this.querySelector('.ui-field__error') as HTMLElement
    }
  }

  private sync() {
    this.ensureStructure()
    if (!this.input) return
    const size = this.getAttribute('size') ?? 'md'
    this.classList.toggle('ui-field--sm', size === 'sm')
    this.classList.toggle('ui-field--md', size === 'md')
    this.classList.toggle('ui-field--lg', size === 'lg')

    const label = this.getAttribute('label')
    if (this.labelEl) {
      this.labelEl.hidden = !label
      this.labelEl.textContent = label ?? ''
    }

    const map: Array<[string, keyof HTMLInputElement | string]> = [
      ['placeholder', 'placeholder'],
      ['type', 'type'],
      ['name', 'name'],
    ]
    for (const [attr, prop] of map) {
      const v = this.getAttribute(attr)
      if (v != null) (this.input as any)[prop] = v
    }
    const value = this.getAttribute('value') ?? this.getAttribute('default-value')
    if (value !== null && this.input.value !== value) {
      this.input.value = value
    }
    this.input.disabled = this.hasAttribute('disabled')
    this.input.readOnly = this.hasAttribute('readonly')
    this.input.required = this.hasAttribute('required')

    const error = this.getAttribute('error')
    const helper = this.getAttribute('helper-text')
    if (this.errorEl) {
      this.errorEl.hidden = !error
      this.errorEl.textContent = error ?? ''
    }
    if (this.helperEl) {
      this.helperEl.hidden = Boolean(error) || !helper
      this.helperEl.textContent = helper ?? ''
    }
    this.toggleAttribute('data-invalid', Boolean(error))
  }
}

export type HInputProps = InputContract
defineOnce('h-input', HInput)
