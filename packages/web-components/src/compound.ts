import { normalizeProps, spreadProps, VanillaMachine } from '@zag-js/vanilla'

export type Cleanup = () => void

/**
 * Small runtime shared by the Web Component renderer.
 * It deliberately does not create markup: the consumer owns the light-DOM
 * structure, while the Zag machine only supplies behavior and DOM props.
 */
export abstract class ZagRootElement<TMachine extends object> extends HTMLElement {
  protected abstract createMachine(): VanillaMachine<any, any>
  protected abstract applyMachine(machine: any, cleanup: Cleanup[]): void

  protected service?: VanillaMachine<any, any>
  protected cleanup: Cleanup[] = []
  private unsubscribe?: Cleanup

  connectedCallback() {
    this.service = this.createMachine()
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.apply())
    this.apply()
  }

  disconnectedCallback() {
    this.unsubscribe?.()
    this.cleanup.forEach(fn => fn())
    this.cleanup = []
    this.service?.stop()
    this.service = undefined
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

export function defineOnce(name: string, element: CustomElementConstructor) {
  if (!customElements.get(name)) customElements.define(name, element)
}
