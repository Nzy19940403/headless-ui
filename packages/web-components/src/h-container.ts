import type { ContainerContract } from '@demo/ui-core'
import { containerClassName, containerStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout, boolAttr } from './layout-shared'

export class HContainer extends HTMLElement {
  static observedAttributes = ['size', 'padded', 'center']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: ContainerContract = {
      size: (this.getAttribute('size') as ContainerContract['size']) ?? 'xl',
      padded: boolAttr(this, 'padded', true),
      center: boolAttr(this, 'center', true),
    }
    applyLayout(this, containerClassName(props), containerStyle(props))
  }
}

export type HContainerProps = ContainerContract
defineOnce('h-container', HContainer)
