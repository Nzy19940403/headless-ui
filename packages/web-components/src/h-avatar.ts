import * as avatar from '@zag-js/avatar'
import { VanillaMachine, normalizeProps } from '@zag-js/vanilla'
import { ZagRootElement, defineOnce, type Cleanup } from './compound'

/** Avatar with image + fallback parts in light DOM. */
export class HAvatar extends ZagRootElement<typeof avatar> {
  static observedAttributes = ['src', 'alt', 'fallback', 'size']

  protected createMachine() {
    return new VanillaMachine(avatar.machine, {
      id: `h-avatar-${crypto.randomUUID()}`,
    })
  }

  protected onAttributeChanged() {
    this.apply()
  }

  protected applyMachine(service: any, _cleanup: Cleanup[]) {
    const size = this.getAttribute('size') ?? 'md'
    this.classList.add('ui-avatar', `ui-avatar--${size}`)
    const api = avatar.connect(service, normalizeProps)
    this.props(this, api.getRootProps())

    let image = this.querySelector<HTMLImageElement>('[data-part="image"], img')
    let fallback = this.querySelector<HTMLElement>('[data-part="fallback"]')
    const src = this.getAttribute('src')
    const alt = this.getAttribute('alt') ?? ''
    const text = this.getAttribute('fallback') ?? (alt ? alt.slice(0, 2).toUpperCase() : '?')

    if (!fallback) {
      fallback = document.createElement('span')
      fallback.dataset.part = 'fallback'
      this.append(fallback)
    }
    fallback.classList.add('ui-avatar__fallback')
    fallback.textContent = text
    this.props(fallback, api.getFallbackProps())

    if (src) {
      if (!image) {
        image = document.createElement('img')
        image.dataset.part = 'image'
        this.append(image)
      }
      image.classList.add('ui-avatar__image')
      image.src = src
      image.alt = alt
      this.props(image, api.getImageProps())
    }
  }
}

defineOnce('h-avatar', HAvatar)
