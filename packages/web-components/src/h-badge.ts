import type { BadgeContract } from '@demo/ui-core'
import { defineOnce } from './compound'

export class HBadge extends HTMLElement {
  static observedAttributes = ['tone', 'dot']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const tone = this.getAttribute('tone') ?? 'neutral'
    const isDot = this.hasAttribute('dot')
    this.classList.add('ui-badge')
    for (const t of ['neutral', 'success', 'warning', 'danger', 'info']) {
      this.classList.toggle(`ui-badge--${t}`, tone === t)
    }
    this.classList.toggle('ui-badge--dot', isDot)
    // Count badge: light DOM text is the label. Dot mode should not show text.
    if (isDot) {
      this.setAttribute('aria-hidden', 'true')
    } else {
      this.removeAttribute('aria-hidden')
    }
  }
}

export type HBadgeProps = BadgeContract
defineOnce('h-badge', HBadge)
