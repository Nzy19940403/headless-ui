import type { EmptyContract } from '@demo/ui-core'
import { defineOnce } from './compound'

/**
 * Empty state — same structure as React/Vue.
 *
 * Light DOM only (no Shadow): do NOT use <slot>, and do NOT reparent
 * consumer children (breaks React synthetic events on re-render).
 * Icon/title/description are injected; remaining children stay as action nodes.
 */
export class HEmpty extends HTMLElement {
  static observedAttributes = ['title', 'description']

  connectedCallback() {
    this.classList.add('ui-empty')
    this.ensureChrome()
    this.syncText()
  }

  attributeChangedCallback() {
    this.syncText()
  }

  private ensureChrome() {
    if (!this.querySelector(':scope > .ui-empty__icon')) {
      const icon = document.createElement('div')
      icon.className = 'ui-empty__icon'
      icon.setAttribute('aria-hidden', 'true')
      icon.textContent = '○'
      this.prepend(icon)
    }
    if (!this.querySelector(':scope > .ui-empty__title')) {
      const title = document.createElement('h3')
      title.className = 'ui-empty__title'
      const icon = this.querySelector(':scope > .ui-empty__icon')
      icon?.after(title)
    }
    if (!this.querySelector(':scope > .ui-empty__description')) {
      const description = document.createElement('p')
      description.className = 'ui-empty__description'
      const title = this.querySelector(':scope > .ui-empty__title')
      title?.after(description)
    }
  }

  private syncText() {
    this.ensureChrome()
    const title = this.getAttribute('title') ?? 'No data'
    const description = this.getAttribute('description')

    const titleEl = this.querySelector<HTMLElement>(':scope > .ui-empty__title')
    const descEl = this.querySelector<HTMLElement>(':scope > .ui-empty__description')

    if (titleEl) {
      titleEl.textContent = title
      titleEl.hidden = !title
    }
    if (descEl) {
      descEl.textContent = description ?? ''
      descEl.hidden = !description
    }
  }
}

export type HEmptyProps = EmptyContract
defineOnce('h-empty', HEmpty)
