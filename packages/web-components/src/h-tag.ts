import type { TagContract } from '@demo/ui-core'

export type HTagProps = TagContract

export class HTag extends HTMLElement {
  static get observedAttributes() {
    return ['tone', 'size', 'content']
  }

  connectedCallback() {
    this.applyState()
  }

  attributeChangedCallback() {
    this.applyState()
  }

  private applyState() {
    const tone = this.getAttribute('tone') ?? 'neutral'
    const size = this.getAttribute('size') ?? 'md'
    this.classList.add('ui-tag')
    this.classList.toggle('ui-tag--neutral', tone === 'neutral')
    this.classList.toggle('ui-tag--success', tone === 'success')
    this.classList.toggle('ui-tag--warning', tone === 'warning')
    this.classList.toggle('ui-tag--danger', tone === 'danger')
    this.classList.toggle('ui-tag--info', tone === 'info')
    this.classList.toggle('ui-tag--sm', size === 'sm')
    this.classList.toggle('ui-tag--md', size === 'md')
    this.classList.toggle('ui-tag--lg', size === 'lg')

    const content = this.getAttribute('content')
    if (content !== null) this.textContent = content
  }
}

if (!customElements.get('h-tag')) customElements.define('h-tag', HTag)
