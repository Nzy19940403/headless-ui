import * as checkbox from '@zag-js/checkbox'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { CheckedChangeDetails, CheckboxContract } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
  booleanAttribute,
} from './compound'

/** Zag Checkbox renderer. The consumer supplies the light-DOM anatomy. */
export class HCheckbox extends ZagRootElement<typeof checkbox> {
  static observedAttributes = ['checked', 'default-checked', 'disabled', 'label']

  declare label: CheckboxContract['label']
  declare defaultChecked: CheckboxContract['defaultChecked']
  declare disabled: CheckboxContract['disabled']

  /** Property-controlled checked (preferred over attribute for controlled `false`). */
  private _checked: boolean | undefined
  private _checkedSet = false

  get checked(): boolean | undefined {
    return this._checkedSet ? this._checked : booleanAttribute(this.getAttribute('checked'))
  }

  set checked(value: boolean | undefined | null) {
    if (value === null || value === undefined) {
      this._checked = undefined
      this._checkedSet = false
      this.removeAttribute('checked')
      this.updateMachineProps({ checked: undefined })
      return
    }
    this._checked = Boolean(value)
    this._checkedSet = true
    this.setAttribute('checked', this._checked ? '' : 'false')
    this.updateMachineProps({ checked: this._checked })
  }

  /** Mirrors React `HCheckboxProps.onCheckedChange`. */
  private _onCheckedChange?: DetailHandler<CheckedChangeDetails>

  get onCheckedChange() {
    return this._onCheckedChange
  }

  set onCheckedChange(handler: DetailHandler<CheckedChangeDetails> | null | undefined) {
    this._onCheckedChange = asDetailHandler(handler)
  }

  protected createMachine() {
    const props: Pick<CheckboxContract, 'checked' | 'defaultChecked' | 'disabled'> = {
      checked: this.checked,
      defaultChecked: this.hasAttribute('default-checked'),
      disabled: this.hasAttribute('disabled'),
    }
    return new VanillaMachine(checkbox.machine, {
      id: `h-checkbox-${crypto.randomUUID()}`,
      ...props,
      onCheckedChange: ({ checked }) => {
        const details: CheckedChangeDetails = { checked: Boolean(checked) }
        emitDetail(this, 'checked-change', details, this._onCheckedChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'checked') {
      this._checked = booleanAttribute(value)
      this._checkedSet = value !== null
      this.updateMachineProps({ checked: this._checked })
    }
    if (name === 'default-checked') this.updateMachineProps({ defaultChecked: value !== null })
    if (name === 'disabled') this.updateMachineProps({ disabled: value !== null })
    if (name === 'label') {
      this.ensureLabel()
      this.apply()
    }
  }

  protected applyMachine(service: any, cleanup: Cleanup[]) {
    this.ensureLabel()
    const api = checkbox.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="indicator"]', api.getIndicatorProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.applyPart('[data-part="hidden-input"]', api.getHiddenInputProps())
    this.bindToggle('[data-part="control"], [data-part="label"]', api.toggleChecked, cleanup)
  }

  private ensureLabel() {
    if (this.querySelector('[data-part="label"]')) return
    const label = this.getAttribute('label')
    if (label === null) return
    const element = document.createElement('span')
    element.dataset.part = 'label'
    element.textContent = label
    this.append(element)
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const element = this.querySelector(selector)
    if (element) this.props(element, props)
  }

  private bindToggle(selector: string, toggle: () => void, cleanup: Cleanup[]) {
    this.querySelectorAll(selector).forEach(element => {
      const handleClick = (event: Event) => {
        event.preventDefault()
        toggle()
      }
      element.addEventListener('click', handleClick)
      cleanup.push(() => element.removeEventListener('click', handleClick))
    })
  }
}

defineOnce('h-checkbox', HCheckbox)
