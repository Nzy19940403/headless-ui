import type { SpacerContract } from '@demo/ui-core'
import { spacerClassName, spacerStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout, boolAttr } from './layout-shared'

export class HSpacer extends HTMLElement {
  static observedAttributes = ['size', 'grow']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: SpacerContract = {
      size: (this.getAttribute('size') as SpacerContract['size']) ?? 'md',
      grow: boolAttr(this, 'grow', true),
    }
    applyLayout(this, spacerClassName(props), spacerStyle(props))
    this.setAttribute('aria-hidden', 'true')
  }
}

export type HSpacerProps = SpacerContract
defineOnce('h-spacer', HSpacer)
