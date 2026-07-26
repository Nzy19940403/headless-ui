export class UiCard extends HTMLElement {
  static get observedAttributes() {
    return ['variant']
  }

  connectedCallback() {
    this.applyState()
  }

  attributeChangedCallback() {
    this.applyState()
  }

  private applyState() {
    const variant = this.getAttribute('variant') ?? 'surface'
    this.classList.add('ui-card')
    this.classList.toggle('ui-card--surface', variant === 'surface')
    this.classList.toggle('ui-card--muted', variant === 'muted')
  }
}

if (!customElements.get('ui-card')) customElements.define('ui-card', UiCard)
