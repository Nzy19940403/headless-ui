import type { VStackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout, boolAttr } from './layout-shared'

export class HVStack extends HTMLElement {
  static observedAttributes = ['gap', 'align', 'justify', 'reverse']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: VStackContract = {
      gap: (this.getAttribute('gap') as VStackContract['gap']) ?? 'md',
      align: (this.getAttribute('align') as VStackContract['align']) ?? 'stretch',
      justify: (this.getAttribute('justify') as VStackContract['justify']) ?? 'start',
      reverse: boolAttr(this, 'reverse', false),
    }
    applyLayout(this, stackClassName('ui-v-stack', props), stackStyle(props))
  }
}

export type HVStackProps = VStackContract
defineOnce('h-v-stack', HVStack)
