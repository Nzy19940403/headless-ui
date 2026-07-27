import * as numberInput from '@zag-js/number-input'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { NumberInputContract, ValueChangeDetails } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
} from './compound'

/**
 * Component: HNumberInput
 * Mode: Generated anatomy
 * State owner: Zag number-input machine
 */
export class HNumberInput extends ZagRootElement<typeof numberInput> {
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
  ]

  private _onValueChange?: DetailHandler<ValueChangeDetails>
  private structureReady = false

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<ValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  protected createMachine() {
    this.ensureStructure()
    const min = this.getAttribute('min')
    const max = this.getAttribute('max')
    const step = this.getAttribute('step')
    return new VanillaMachine(numberInput.machine, {
      id: `h-number-${crypto.randomUUID()}`,
      value: this.hasAttribute('value') ? (this.getAttribute('value') ?? '') : undefined,
      defaultValue: this.getAttribute('default-value') ?? undefined,
      min: min != null ? Number(min) : undefined,
      max: max != null ? Number(max) : undefined,
      step: step != null ? Number(step) : undefined,
      disabled: this.hasAttribute('disabled'),
      readOnly: this.hasAttribute('readonly'),
      name: this.getAttribute('name') ?? undefined,
      invalid: Boolean(this.getAttribute('error')),
      onValueChange: ({ value }) => {
        emitDetail(this, 'value-change', { value } satisfies ValueChangeDetails, this._onValueChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'value') this.updateMachineProps({ value: value ?? undefined })
    if (name === 'default-value') this.updateMachineProps({ defaultValue: value ?? undefined })
    if (name === 'min') this.updateMachineProps({ min: value != null ? Number(value) : undefined })
    if (name === 'max') this.updateMachineProps({ max: value != null ? Number(value) : undefined })
    if (name === 'step') this.updateMachineProps({ step: value != null ? Number(value) : undefined })
    if (name === 'disabled') this.updateMachineProps({ disabled: value !== null })
    if (name === 'readonly') this.updateMachineProps({ readOnly: value !== null })
    if (name === 'name') this.updateMachineProps({ name: value ?? undefined })
    if (name === 'error') {
      this.updateMachineProps({ invalid: Boolean(value) })
      this.syncMeta()
    }
    if (name === 'label' || name === 'helper-text') this.syncMeta()
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    this.ensureStructure()
    this.syncMeta()
    const api = numberInput.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="input"]', api.getInputProps())
    this.applyPart('[data-part="increment-trigger"]', api.getIncrementTriggerProps())
    this.applyPart('[data-part="decrement-trigger"]', api.getDecrementTriggerProps())
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const el = this.querySelector(selector)
    if (el) this.props(el, props)
  }

  private ensureStructure() {
    if (this.structureReady && this.querySelector('[data-part="input"]')) return
    this.classList.add('ui-number-input')
    this.innerHTML = ''
    const label = document.createElement('label')
    label.dataset.part = 'label'
    label.className = 'ui-field__label'
    const control = document.createElement('div')
    control.dataset.part = 'control'
    control.className = 'ui-number-input__control'
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
