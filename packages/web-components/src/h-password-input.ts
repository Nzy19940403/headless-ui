import * as passwordInput from '@zag-js/password-input'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { PasswordInputContract, ValueChangeDetails } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
} from './compound'

/**
 * Component: HPasswordInput
 * Mode: Generated anatomy
 * State owner: Zag password-input (visibility only); value from native input
 */
export class HPasswordInput extends ZagRootElement<typeof passwordInput> {
  static observedAttributes = [
    'value',
    'default-value',
    'placeholder',
    'disabled',
    'readonly',
    'name',
    'label',
    'error',
    'helper-text',
  ]

  private _onValueChange?: DetailHandler<ValueChangeDetails>
  private structureReady = false
  private inputBound = false

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  protected createMachine() {
    this.ensureStructure()
    return new VanillaMachine(passwordInput.machine, {
      id: `h-password-${crypto.randomUUID()}`,
      disabled: this.hasAttribute('disabled'),
      readOnly: this.hasAttribute('readonly'),
      invalid: Boolean(this.getAttribute('error')),
      name: this.getAttribute('name') ?? undefined,
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'disabled') this.updateMachineProps({ disabled: value !== null })
    if (name === 'readonly') this.updateMachineProps({ readOnly: value !== null })
    if (name === 'name') this.updateMachineProps({ name: value ?? undefined })
    if (name === 'error') {
      this.updateMachineProps({ invalid: Boolean(value) })
      this.syncMeta()
    }
    if (name === 'label' || name === 'helper-text' || name === 'placeholder' || name === 'value' || name === 'default-value') {
      this.syncInputAttrs()
      this.syncMeta()
    }
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    this.ensureStructure()
    this.syncMeta()
    this.syncInputAttrs()
    const api = passwordInput.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="input"]', api.getInputProps())
    this.applyPart('[data-part="visibility-trigger"]', api.getVisibilityTriggerProps())
    this.applyPart('[data-part="indicator"]', api.getIndicatorProps())

    const indicator = this.querySelector<HTMLElement>('[data-part="indicator"]')
    if (indicator) indicator.textContent = api.visible ? 'Hide' : 'Show'

    if (!this.inputBound) {
      const input = this.querySelector<HTMLInputElement>('[data-part="input"]')
      if (input) {
        const onInput = () => {
          emitDetail(this, 'value-change', { value: input.value } satisfies ValueChangeDetails, this._onValueChange)
        }
        input.addEventListener('input', onInput)
        cleanup.push(() => {
          input.removeEventListener('input', onInput)
          this.inputBound = false
        })
        this.inputBound = true
      }
    }
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const el = this.querySelector(selector)
    if (el) this.props(el, props)
  }

  private ensureStructure() {
    if (this.structureReady && this.querySelector('[data-part="input"]')) return
    this.classList.add('ui-password-input')
    this.innerHTML = ''
    const label = document.createElement('label')
    label.dataset.part = 'label'
    label.className = 'ui-field__label'
    const control = document.createElement('div')
    control.dataset.part = 'control'
    control.className = 'ui-password-input__control'
    const input = document.createElement('input')
    input.dataset.part = 'input'
    input.className = 'ui-password-input__input'
    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.dataset.part = 'visibility-trigger'
    trigger.className = 'ui-password-input__trigger'
    const indicator = document.createElement('span')
    indicator.dataset.part = 'indicator'
    indicator.className = 'ui-password-input__indicator'
    indicator.textContent = 'Show'
    trigger.append(indicator)
    control.append(input, trigger)
    const helper = document.createElement('span')
    helper.className = 'ui-field__helper'
    helper.dataset.part = 'helper'
    const error = document.createElement('span')
    error.className = 'ui-field__error'
    error.dataset.part = 'error'
    this.append(label, control, helper, error)
    this.structureReady = true
  }

  private syncInputAttrs() {
    const input = this.querySelector<HTMLInputElement>('[data-part="input"]')
    if (!input) return
    const placeholder = this.getAttribute('placeholder')
    if (placeholder != null) input.placeholder = placeholder
    const value = this.getAttribute('value') ?? this.getAttribute('default-value')
    if (value !== null && input.value !== value) input.value = value
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

export type HPasswordInputProps = PasswordInputContract
defineOnce('h-password-input', HPasswordInput)
