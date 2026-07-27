import type { SplitContract } from '@demo/ui-core'
import { splitClassName, splitStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout } from './layout-shared'

export class HSplit extends HTMLElement {
  static observedAttributes = ['ratio', 'gap', 'collapse-below', 'sidebar-width', 'align']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: SplitContract = {
      ratio: (this.getAttribute('ratio') as SplitContract['ratio']) ?? '1:1',
      gap: (this.getAttribute('gap') as SplitContract['gap']) ?? 'md',
      collapseBelow:
        (this.getAttribute('collapse-below') as SplitContract['collapseBelow']) ?? 'md',
      sidebarWidth: this.getAttribute('sidebar-width') ?? '320px',
      align: (this.getAttribute('align') as SplitContract['align']) ?? 'stretch',
    }
    applyLayout(this, splitClassName(props), splitStyle(props))
  }
}

export type HSplitProps = SplitContract
defineOnce('h-split', HSplit)
