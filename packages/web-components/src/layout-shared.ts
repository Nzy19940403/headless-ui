import type { LayoutStyleMap } from '@demo/ui-core'

/** CSS custom props managed by layout primitives (cleared before re-apply). */
const MANAGED_PREFIXES = [
  '--ui-container-size',
  '--ui-layout-gap',
  '--ui-layout-align',
  '--ui-layout-justify',
  '--ui-layout-row-gap',
  '--ui-layout-column-gap',
  '--ui-grid-columns',
  '--ui-grid-min',
  '--ui-split-template',
  '--ui-sidebar-width',
  '--ui-spacer-size',
]

export function boolAttr(el: HTMLElement, name: string, defaultValue: boolean): boolean {
  if (!el.hasAttribute(name)) return defaultValue
  const v = el.getAttribute(name)
  if (v === null || v === '' || v === 'true' || v === name) return true
  if (v === 'false' || v === '0') return false
  return defaultValue
}

export function applyLayoutClasses(el: HTMLElement, className: string) {
  const keep: string[] = []
  el.classList.forEach(c => {
    if (
      !c.startsWith('ui-container') &&
      !c.startsWith('ui-stack') &&
      !c.startsWith('ui-v-stack') &&
      !c.startsWith('ui-grid') &&
      !c.startsWith('ui-split') &&
      !c.startsWith('ui-spacer')
    ) {
      keep.push(c)
    }
  })
  const next = className.split(/\s+/).filter(Boolean)
  el.className = Array.from(new Set(next.concat(keep))).join(' ')
}

/** Apply style map onto host; clears previous managed CSS variables first. */
export function applyLayoutStyle(el: HTMLElement, style: LayoutStyleMap) {
  for (let i = el.style.length - 1; i >= 0; i--) {
    const name = el.style.item(i)
    if (!name) continue
    if (MANAGED_PREFIXES.some(p => name === p || name.startsWith(`${p}-`))) {
      el.style.removeProperty(name)
    }
  }
  for (const [k, v] of Object.entries(style)) {
    el.style.setProperty(k, v)
  }
}

export function applyLayout(el: HTMLElement, className: string, style: LayoutStyleMap) {
  applyLayoutClasses(el, className)
  applyLayoutStyle(el, style)
}
