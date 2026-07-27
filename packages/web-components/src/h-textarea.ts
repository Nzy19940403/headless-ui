import type { TextareaContract, ValueChangeDetails } from '@demo/ui-core'
import { defineOnce, emitDetail, asDetailHandler, upgradeDetailHandlerProperties, type DetailHandler } from './compound'

/** Multi-line field. Same Field styling contract as HInput. */
export class HTextarea extends HTMLElement {
  static observedAttributes = [
    'label',
    'placeholder',
    'value',
    'default-value',
    'disabled',
    'required',
    'error',
    'helper-text',
    'size',
    'name',
    'readonly',
    'rows',
  ]

  private textarea?: HTMLTextAreaElement
  private labelEl?: HTMLLabelElement
  private helperEl?: HTMLElement
  private errorEl?: HTMLElement

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
    this.textarea?.addEventListener('input', this.onInput)
  }

  disconnectedCallback() {
    this.textarea?.removeEventListener('input', this.onInput)
  }

  attributeChangedCallback() {
    this.sync()
  }

  private onInput = () => {
    const value = this.textarea?.value ?? ''
    emitDetail(this, 'value-change', { value } satisfies ValueChangeDetails, this._onValueChange)
  }

  private ensureStructure() {
    if (!this.querySelector('.ui-textarea')) {
      this.innerHTML = ''
      this.labelEl = document.createElement('label')
      this.labelEl.className = 'ui-field__label'
      this.textarea = document.createElement('textarea')
      this.textarea.className = 'ui-textarea'
      this.helperEl = document.createElement('span')
      this.helperEl.className = 'ui-field__helper'
      this.errorEl = document.createElement('span')
      this.errorEl.className = 'ui-field__error'
      this.append(this.labelEl, this.textarea, this.helperEl, this.errorEl)
    } else {
      this.labelEl = this.querySelector('.ui-field__label') as HTMLLabelElement
      this.textarea = this.querySelector('.ui-textarea') as HTMLTextAreaElement
      this.helperEl = this.querySelector('.ui-field__helper') as HTMLElement
      this.errorEl = this.querySelector('.ui-field__error') as HTMLElement
    }
  }

  private sync() {
    this.ensureStructure()
    if (!this.textarea) return
    const size = this.getAttribute('size') ?? 'md'
    this.classList.toggle('ui-field--sm', size === 'sm')
    this.classList.toggle('ui-field--md', size === 'md')
    this.classList.toggle('ui-field--lg', size === 'lg')

    const label = this.getAttribute('label')
    if (this.labelEl) {
      this.labelEl.hidden = !label
      this.labelEl.textContent = label ?? ''
    }

    const placeholder = this.getAttribute('placeholder')
    if (placeholder != null) this.textarea.placeholder = placeholder
    const name = this.getAttribute('name')
    if (name != null) this.textarea.name = name
    const rows = this.getAttribute('rows')
    this.textarea.rows = rows ? Number(rows) : 3

    const value = this.getAttribute('value') ?? this.getAttribute('default-value')
    if (value !== null && this.textarea.value !== value) this.textarea.value = value

    this.textarea.disabled = this.hasAttribute('disabled')
    this.textarea.readOnly = this.hasAttribute('readonly')
    this.textarea.required = this.hasAttribute('required')

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

export type HTextareaProps = TextareaContract
defineOnce('h-textarea', HTextarea)
