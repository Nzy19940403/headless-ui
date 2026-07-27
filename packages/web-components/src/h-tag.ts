import type { TagContract } from '@demo/ui-core'

export type HTagProps = TagContract

export class HTag extends HTMLElement {
  static get observedAttributes() {
    return ['tone']
  }

  connectedCallback() {
    this.applyState()
  }

  attributeChangedCallback() {
    this.applyState()
  }

  private applyState() {
    const tone = this.getAttribute('tone') ?? 'neutral'
    this.classList.add('ui-tag')
    this.classList.toggle('ui-tag--neutral', tone === 'neutral')
    this.classList.toggle('ui-tag--success', tone === 'success')
    this.classList.toggle('ui-tag--warning', tone === 'warning')
    this.classList.toggle('ui-tag--danger', tone === 'danger')
    this.classList.toggle('ui-tag--info', tone === 'info')
  }
}

if (!customElements.get('h-tag')) customElements.define('h-tag', HTag)
