import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla'

export type Cleanup = () => void

/** Callback style matching React props when that React component exposes one. */
export type DetailHandler<T> = (detail: T) => void

/**
 * Dispatch DOM CustomEvent and optionally invoke a React-style property callback.
 *
 * Rule: only wire `onValueChange` / `onCheckedChange` / `onOpenChange` on a WC
 * when the matching React component (`packages/react/src/H*.tsx`) exposes that prop.
 * Do not invent callbacks React does not have.
 *
 * Always keep the kebab CustomEvent for addEventListener users.
 * Payload must match Core details (same object React passes to its handler).
 */
export type DetailEventName =
  | 'value-change'
  | 'checked-change'
  | 'open-change'
  | 'focus-change'
  | 'view-change'
  | 'visible-range-change'
  | 'sorting-change'
  | 'pagination-change'
  | 'chart-click'
  | 'expanded-change'
  | 'selection-change'

export function emitDetail<T>(
  host: HTMLElement,
  eventName: DetailEventName,
  detail: T,
  propertyHandler?: DetailHandler<T> | null,
) {
  host.dispatchEvent(new CustomEvent(eventName, {
    detail,
    bubbles: true,
    composed: true,
  }))
  if (typeof propertyHandler === 'function') propertyHandler(detail)
}

/** Normalize host-assigned callback props (function or clear). */
export function asDetailHandler<T>(value: unknown): DetailHandler<T> | undefined {
  return typeof value === 'function' ? (value as DetailHandler<T>) : undefined
}

/**
 * Re-apply properties assigned before custom element upgrade.
 *
 * Without this, `el.onValueChange = fn` can become an own property on the
 * element instance and shadow the prototype setter after upgrade.
 */
export function upgradeProperty(host: HTMLElement, name: string) {
  if (!Object.prototype.hasOwnProperty.call(host, name)) return
  const value = (host as HTMLElement & Record<string, unknown>)[name]
  delete (host as HTMLElement & Record<string, unknown>)[name]
  ;(host as HTMLElement & Record<string, unknown>)[name] = value
}

export function upgradeDetailHandlerProperties(host: HTMLElement) {
  upgradeProperty(host, 'onValueChange')
  upgradeProperty(host, 'onCheckedChange')
  upgradeProperty(host, 'onOpenChange')
  upgradeProperty(host, 'onFocusChange')
  upgradeProperty(host, 'onViewChange')
  upgradeProperty(host, 'onVisibleRangeChange')
  upgradeProperty(host, 'onSortingChange')
  upgradeProperty(host, 'onPaginationChange')
  upgradeProperty(host, 'onChartClick')
  upgradeProperty(host, 'onExpandedChange')
  upgradeProperty(host, 'onSelectionChange')
}

/**
 * Shared runtime for the Web Component renderer.
 *
 * The component owns the Zag machine lifecycle and applies DOM props to
 * consumer-owned light DOM. It intentionally does not create markup.
 */
export abstract class ZagRootElement<TMachine extends object> extends HTMLElement {
  protected abstract createMachine(): VanillaMachine<any>
  protected abstract applyMachine(machine: any, cleanup: Cleanup[]): void

  protected service?: VanillaMachine<any>
  protected cleanup: Cleanup[] = []
  private unsubscribe?: Cleanup

  connectedCallback() {
    if (this.service) return
    upgradeDetailHandlerProperties(this)
    this.service = this.createMachine()
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.apply())
    this.apply()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.cleanup.forEach(fn => fn())
    this.cleanup = []
    this.service?.stop()
    this.service = undefined
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return
    this.onAttributeChanged(name, newValue)
  }

  protected onAttributeChanged(_name: string, _value: string | null) {}

  protected updateMachineProps(props: Record<string, unknown>) {
    this.service?.updateProps(props)
  }

  protected apply() {
    if (!this.service) return
    this.cleanup.forEach(fn => fn())
    this.cleanup = []
    this.applyMachine(this.service.service, this.cleanup)
  }

  protected props(target: Element, value: Record<string, unknown>) {
    this.cleanup.push(spreadProps(target, value))
  }

  protected connect<T>(connect: (service: any, normalize: any) => T) {
    return connect(this.service!.service, normalizeProps)
  }
}

export function childrenOf<T extends Element>(root: Element, selector: string) {
  return Array.from(root.querySelectorAll<T>(selector)).filter(node => node.closest(root.tagName.toLowerCase()) === root)
}

/**
 * Parse list-valued attributes (accordion value, etc.).
 * - attribute absent (`null`) → uncontrolled (`undefined`)
 * - attribute present but empty (`""`) → controlled empty (`[]`)
 * - `"a,b"` → `['a','b']`
 */
export function listAttribute(value: string | null): string[] | undefined {
  if (value === null) return undefined
  if (!value.trim()) return []
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

/**
 * Boolean controlled attrs for CE:
 * - absent → uncontrolled (`undefined`)
 * - present `"false"` → controlled `false`
 * - present otherwise (incl. `""` / `"true"`) → controlled `true`
 */
export function booleanAttribute(value: string | null): boolean | undefined {
  if (value === null) return undefined
  return value !== 'false'
}

export function defineOnce(name: string, element: CustomElementConstructor) {
  if (!customElements.get(name)) customElements.define(name, element)
}
