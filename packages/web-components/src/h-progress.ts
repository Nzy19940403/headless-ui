import * as progress from '@zag-js/progress'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, defineOnce, type Cleanup } from './compound'

/** Linear progress: optional label/value-text + track/range parts. */
export class HProgress extends ZagRootElement<typeof progress> {
  static observedAttributes = ['value', 'min', 'max', 'label', 'indeterminate']

  protected createMachine() {
    const indeterminate = this.hasAttribute('indeterminate')
    return new VanillaMachine(progress.machine, {
      id: `h-progress-${crypto.randomUUID()}`,
      value: indeterminate ? null : Number(this.getAttribute('value') ?? 0),
      min: Number(this.getAttribute('min') ?? 0),
      max: Number(this.getAttribute('max') ?? 100),
    })
  }

  protected onAttributeChanged(name: string, value: string | null) {
    if (name === 'indeterminate') this.updateMachineProps({ value: value !== null ? null : Number(this.getAttribute('value') ?? 0) })
    if (name === 'value' && !this.hasAttribute('indeterminate')) this.updateMachineProps({ value: Number(value ?? 0) })
    if (name === 'min') this.updateMachineProps({ min: Number(value ?? 0) })
    if (name === 'max') this.updateMachineProps({ max: Number(value ?? 100) })
    if (name === 'label') this.apply()
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    this.classList.add('ui-progress')
    const api = progress.connect(service, normalizeProps)
    this.props(this, api.getRootProps())

    let header = this.querySelector('.ui-progress__header')
    let label = this.querySelector('[data-part="label"]')
    let valueText = this.querySelector('[data-part="value-text"]')
    let track = this.querySelector('[data-part="track"]')
    let range = this.querySelector('[data-part="range"]')

    const labelText = this.getAttribute('label')
    if (labelText) {
      if (!header) {
        header = document.createElement('div')
        header.className = 'ui-progress__header'
        this.prepend(header)
      }
      if (!label) {
        label = document.createElement('span')
        label.setAttribute('data-part', 'label')
        header.append(label)
      }
      label.classList.add('ui-progress__label')
      label.textContent = labelText
      this.props(label, api.getLabelProps())
      if (!this.hasAttribute('indeterminate')) {
        if (!valueText) {
          valueText = document.createElement('span')
          valueText.setAttribute('data-part', 'value-text')
          header.append(valueText)
        }
        valueText.classList.add('ui-progress__value')
        valueText.textContent = api.valueAsString
        this.props(valueText, api.getValueTextProps())
      }
    }

    if (!track) {
      track = document.createElement('div')
      track.setAttribute('data-part', 'track')
      this.append(track)
    }
    track.classList.add('ui-progress__track')
    this.props(track, api.getTrackProps())

    if (!range) {
      range = document.createElement('div')
      range.setAttribute('data-part', 'range')
      track.append(range)
    }
    range.classList.add('ui-progress__range')
    this.props(range, api.getRangeProps())
  }
}

defineOnce('h-progress', HProgress)
