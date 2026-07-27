import * as slider from '@zag-js/slider'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import type { NumberValueChangeDetails, SliderContract } from '@demo/ui-core'
import {
  ZagRootElement,
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  type DetailHandler,
} from './compound'

/**
 * Component: HSlider (single thumb)
 * Mode: Generated anatomy
 * State owner: Zag slider machine
 */
export class HSlider extends ZagRootElement<typeof slider> {
  static observedAttributes = ['value', 'default-value', 'min', 'max', 'step', 'disabled', 'name', 'label']

  private _onValueChange?: DetailHandler<NumberValueChangeDetails>
  private structureReady = false

  get onValueChange() {
    return this._onValueChange
  }

  set onValueChange(handler: DetailHandler<NumberValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  protected createMachine() {
    this.ensureStructure()
    const min = Number(this.getAttribute('min') ?? 0)
    const max = Number(this.getAttribute('max') ?? 100)
    const step = Number(this.getAttribute('step') ?? 1)
    const valueAttr = this.getAttribute('value')
    const defaultAttr = this.getAttribute('default-value')
    return new VanillaMachine(slider.machine, {
      id: `h-slider-${crypto.randomUUID()}`,
      min,
      max,
      step,
      value: valueAttr != null ? [Number(valueAttr)] : undefined,
      defaultValue: defaultAttr != null ? [Number(defaultAttr)] : [min],
      disabled: this.hasAttribute('disabled'),
      name: this.getAttribute('name') ?? undefined,
      thumbAlignment: 'center',
      onValueChange: ({ value }) => {
        const v = value[0] ?? min
        emitDetail(this, 'value-change', { value: v } satisfies NumberValueChangeDetails, this._onValueChange)
      },
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'value') this.updateMachineProps({ value: value != null ? [Number(value)] : undefined })
    if (name === 'default-value') this.updateMachineProps({ defaultValue: value != null ? [Number(value)] : undefined })
    if (name === 'min') this.updateMachineProps({ min: value != null ? Number(value) : 0 })
    if (name === 'max') this.updateMachineProps({ max: value != null ? Number(value) : 100 })
    if (name === 'step') this.updateMachineProps({ step: value != null ? Number(value) : 1 })
    if (name === 'disabled') this.updateMachineProps({ disabled: value !== null })
    if (name === 'name') this.updateMachineProps({ name: value ?? undefined })
    if (name === 'label') this.syncLabel()
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    this.ensureStructure()
    this.syncLabel()
    const api = slider.connect(service, normalizeProps)
    this.props(this, api.getRootProps())
    this.applyPart('[data-part="label"]', api.getLabelProps())
    this.applyPart('[data-part="value-text"]', api.getValueTextProps())
    this.applyPart('[data-part="control"]', api.getControlProps())
    this.applyPart('[data-part="track"]', api.getTrackProps())
    this.applyPart('[data-part="range"]', api.getRangeProps())
    this.applyPart('[data-part="thumb"]', api.getThumbProps({ index: 0 }))
    this.applyPart('[data-part="hidden-input"]', api.getHiddenInputProps({ index: 0 }))
    const valueText = this.querySelector<HTMLElement>('[data-part="value-text"]')
    if (valueText) valueText.textContent = String(api.value[0] ?? '')
  }

  private applyPart(selector: string, props: Record<string, unknown>) {
    const el = this.querySelector(selector)
    if (el) this.props(el, props)
  }

  private ensureStructure() {
    if (this.structureReady && this.querySelector('[data-part="thumb"]')) return
    this.classList.add('ui-slider')
    this.innerHTML = ''
    const header = document.createElement('div')
    header.className = 'ui-slider__header'
    const label = document.createElement('label')
    label.dataset.part = 'label'
    label.className = 'ui-field__label'
    const valueText = document.createElement('span')
    valueText.dataset.part = 'value-text'
    valueText.className = 'ui-slider__value'
    header.append(label, valueText)
    const control = document.createElement('div')
    control.dataset.part = 'control'
    control.className = 'ui-slider__control'
    const track = document.createElement('div')
    track.dataset.part = 'track'
    track.className = 'ui-slider__track'
    const range = document.createElement('div')
    range.dataset.part = 'range'
    range.className = 'ui-slider__range'
    track.append(range)
    const thumb = document.createElement('div')
    thumb.dataset.part = 'thumb'
    thumb.className = 'ui-slider__thumb'
    const hidden = document.createElement('input')
    hidden.dataset.part = 'hidden-input'
    thumb.append(hidden)
    control.append(track, thumb)
    this.append(header, control)
    this.structureReady = true
  }

  private syncLabel() {
    const label = this.querySelector<HTMLElement>('[data-part="label"]')
    const text = this.getAttribute('label')
    if (label) {
      label.hidden = !text
      label.textContent = text ?? ''
    }
  }
}

export type HSliderProps = SliderContract
defineOnce('h-slider', HSlider)
