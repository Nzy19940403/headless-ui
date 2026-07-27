import type { StackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout, boolAttr } from './layout-shared'

export class HStack extends HTMLElement {
  static observedAttributes = ['gap', 'align', 'justify', 'wrap', 'reverse']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: StackContract = {
      gap: (this.getAttribute('gap') as StackContract['gap']) ?? 'md',
      align: (this.getAttribute('align') as StackContract['align']) ?? 'stretch',
      justify: (this.getAttribute('justify') as StackContract['justify']) ?? 'start',
      wrap: boolAttr(this, 'wrap', false),
      reverse: boolAttr(this, 'reverse', false),
    }
    applyLayout(this, stackClassName('ui-stack', props, undefined, props.wrap), stackStyle(props))
  }
}

export type HStackProps = StackContract
defineOnce('h-stack', HStack)
