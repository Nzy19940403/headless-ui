import type { GridContract } from '@demo/ui-core'
import { gridClassName, gridStyle } from '@demo/ui-core'
import { defineOnce } from './compound'
import { applyLayout, boolAttr } from './layout-shared'

export class HGrid extends HTMLElement {
  static observedAttributes = [
    'columns',
    'min-child-width',
    'gap',
    'row-gap',
    'column-gap',
    'equal-height',
  ]

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const props: GridContract = {
      columns: (this.getAttribute('columns') as GridContract['columns']) ?? 'auto-fit',
      minChildWidth: this.getAttribute('min-child-width') ?? '240px',
      gap: (this.getAttribute('gap') as GridContract['gap']) ?? 'md',
      rowGap: (this.getAttribute('row-gap') as GridContract['rowGap']) ?? undefined,
      columnGap: (this.getAttribute('column-gap') as GridContract['columnGap']) ?? undefined,
      equalHeight: boolAttr(this, 'equal-height', false),
    }
    applyLayout(this, gridClassName(props), gridStyle(props))
  }
}

export type HGridProps = GridContract
defineOnce('h-grid', HGrid)
