import type { SeparatorContract } from '@demo/ui-core'
import { defineOnce } from './compound'

export class HSeparator extends HTMLElement {
  static observedAttributes = ['orientation']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const orientation = this.getAttribute('orientation') ?? 'horizontal'
    this.classList.add('ui-separator', `ui-separator--${orientation}`)
    this.setAttribute('role', 'separator')
    this.setAttribute('aria-orientation', orientation)
  }
}

export type HSeparatorProps = SeparatorContract
defineOnce('h-separator', HSeparator)
