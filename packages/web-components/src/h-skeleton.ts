import type { SkeletonContract } from '@demo/ui-core'
import { defineOnce } from './compound'

export class HSkeleton extends HTMLElement {
  static observedAttributes = ['width', 'height', 'circle', 'animated']

  connectedCallback() {
    this.apply()
  }

  attributeChangedCallback() {
    this.apply()
  }

  private apply() {
    const width = this.getAttribute('width') ?? '100%'
    const height = this.getAttribute('height') ?? '1rem'
    const circle = this.hasAttribute('circle')
    const animated = this.getAttribute('animated') !== 'false'
    this.classList.add('ui-skeleton')
    this.classList.toggle('ui-skeleton--circle', circle)
    this.classList.toggle('ui-skeleton--animated', animated)
    this.style.width = circle ? height : width
    this.style.height = height
    this.setAttribute('aria-hidden', 'true')
  }
}

export type HSkeletonProps = SkeletonContract
defineOnce('h-skeleton', HSkeleton)
