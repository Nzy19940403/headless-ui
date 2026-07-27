import type { CardContract } from '@demo/ui-core'

export type HCardProps = CardContract<string>

export class HCard extends HTMLElement {
  static get observedAttributes() {
    return ['variant', 'title', 'description']
  }

  connectedCallback() {
    this.applyState()
    this.syncHeader()
  }

  attributeChangedCallback() {
    this.applyState()
    this.syncHeader()
  }

  private applyState() {
    const variant = this.getAttribute('variant') ?? 'surface'
    this.classList.add('ui-card')
    this.classList.toggle('ui-card--surface', variant === 'surface')
    this.classList.toggle('ui-card--muted', variant === 'muted')
  }

  private syncHeader() {
    const title = this.getAttribute('title')
    const description = this.getAttribute('description')
    if (!title && !description) {
      this.querySelector('[data-generated-card-header]')?.remove()
      return
    }

    let header = this.querySelector<HTMLElement>('[data-generated-card-header]')
    if (!header) {
      if (this.querySelector('.ui-card__header')) return
      header = document.createElement('header')
      header.dataset.generatedCardHeader = ''
      header.className = 'ui-card__header'
      this.prepend(header)
    }

    header.replaceChildren()
    if (title) {
      const heading = document.createElement('h3')
      heading.className = 'ui-card__title'
      heading.textContent = title
      header.append(heading)
    }
    if (description) {
      const text = document.createElement('p')
      text.className = 'ui-card__description'
      text.textContent = description
      header.append(text)
    }
  }
}

if (!customElements.get('h-card')) customElements.define('h-card', HCard)
