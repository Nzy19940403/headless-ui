export class UiButton extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled']
  }

  connectedCallback() {
    this.applyState()
    this.setAttribute('role', 'button')
    if (!this.hasAttribute('tabindex')) this.tabIndex = 0
    this.addEventListener('click', this.handleClick, { capture: true })
    this.addEventListener('keydown', this.handleKeyDown)
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick, { capture: true })
    this.removeEventListener('keydown', this.handleKeyDown)
  }

  attributeChangedCallback() {
    this.applyState()
  }

  private applyState() {
    const variant = this.getAttribute('variant') ?? 'primary'
    const size = this.getAttribute('size') ?? 'md'
    const disabled = this.hasAttribute('disabled')

    this.classList.add('ui-button')
    this.classList.toggle('ui-button--primary', variant === 'primary')
    this.classList.toggle('ui-button--secondary', variant === 'secondary')
    this.classList.toggle('ui-button--ghost', variant === 'ghost')
    this.classList.toggle('ui-button--sm', size === 'sm')
    this.classList.toggle('ui-button--md', size === 'md')
    this.classList.toggle('ui-button--lg', size === 'lg')
    this.setAttribute('aria-disabled', String(disabled))
    this.tabIndex = disabled ? -1 : 0
  }

  private handleClick = (event: MouseEvent) => {
    if (!this.hasAttribute('disabled')) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.hasAttribute('disabled')) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    this.click()
  }
}

if (!customElements.get('ui-button')) customElements.define('ui-button', UiButton)
