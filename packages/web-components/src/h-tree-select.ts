import { LitElement, html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import * as popover from '@zag-js/popover'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type {
  TreeNodeContract,
  TreeSelectContract,
  TreeSelectNodeRenderContext,
  TreeSelectTagRenderContext,
  TreeSelectValue,
  TreeSelectValueChangeDetails,
  TreeSelectValueRenderContext,
  TreeExpandedChangeDetails,
} from '@demo/ui-core'
import {
  flattenTreeSelectNodes,
  normalizeTreeSelectValue,
  resolveTreeSelectColumns,
  resolveTreeSelectColumnWidth,
  resolveTreeSelectPath,
} from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

const jsonConverter = {
  fromAttribute(value: string | null) {
    if (value == null || value === '') return undefined
    try {
      return JSON.parse(value)
    } catch {
      return undefined
    }
  },
  toAttribute(value: unknown) {
    if (value === undefined) return null
    return JSON.stringify(value)
  },
}

type NodeRenderFn = (ctx: TreeSelectNodeRenderContext) => Node | string | null | undefined
type ValueRenderFn = (ctx: TreeSelectValueRenderContext) => Node | string | null | undefined
type TagRenderFn = (
  ctx: TreeSelectTagRenderContext & { onRemove: () => void },
) => Node | string | null | undefined

/**
 * Cascader-style tree select (Popover + columns).
 *
 * Custom node/value/tag content:
 * 1. Property handlers: `renderNode` / `renderValue` / `renderTag` (JS functions)
 * 2. Light-DOM templates: `<template data-slot="node|value|tag">` with
 *    `[data-bind="label"|"id"|…]` filled from context; `[data-action="remove"]` on tags
 */
export class HTreeSelect extends LitElement {
  static properties = {
    nodes: { type: Array, converter: jsonConverter },
    value: { converter: jsonConverter },
    defaultValue: { attribute: 'default-value', converter: jsonConverter },
    placeholder: { type: String },
    disabled: { type: Boolean, reflect: true },
    name: { type: String },
    label: { type: String },
    selectBranches: { type: Boolean, attribute: 'select-branches' },
    multiple: { type: Boolean },
    height: {
      converter: {
        fromAttribute(value: string | null) {
          if (value == null || value === '') return 240
          const n = Number(value)
          return Number.isFinite(n) ? n : value
        },
      },
    },
    columnWidth: {
      attribute: 'column-width',
      converter: {
        fromAttribute(value: string | null) {
          if (value == null || value === '') return 180
          const n = Number(value)
          return Number.isFinite(n) ? n : value
        },
      },
    },
    columnWidths: { attribute: 'column-widths', converter: jsonConverter },
    defaultExpandedValue: { attribute: 'default-expanded-value', converter: jsonConverter },
    expandedValue: { attribute: 'expanded-value', converter: jsonConverter },
  }

  declare nodes: TreeNodeContract[]
  declare value: TreeSelectValue | undefined
  declare defaultValue: TreeSelectValue | undefined
  declare placeholder: string
  declare disabled: boolean
  declare name: string | undefined
  declare label: string | undefined
  declare selectBranches: boolean
  declare multiple: boolean
  declare height: number | string
  declare columnWidth: number | string
  declare columnWidths: Array<number | string> | undefined
  declare defaultExpandedValue: string[] | undefined
  declare expandedValue: string[] | undefined

  private _onValueChange?: DetailHandler<TreeSelectValueChangeDetails>
  private _onExpandedChange?: DetailHandler<TreeExpandedChangeDetails>
  private _renderNode?: NodeRenderFn
  private _renderValue?: ValueRenderFn
  private _renderTag?: TagRenderFn

  get onValueChange() {
    return this._onValueChange
  }
  set onValueChange(handler: DetailHandler<TreeSelectValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }

  get onExpandedChange() {
    return this._onExpandedChange
  }
  set onExpandedChange(handler: DetailHandler<TreeExpandedChangeDetails> | null | undefined) {
    this._onExpandedChange = asDetailHandler(handler)
  }

  get renderNode() {
    return this._renderNode
  }
  set renderNode(fn: NodeRenderFn | null | undefined) {
    this._renderNode = typeof fn === 'function' ? fn : undefined
    this.requestUpdate()
  }

  get renderValue() {
    return this._renderValue
  }
  set renderValue(fn: ValueRenderFn | null | undefined) {
    this._renderValue = typeof fn === 'function' ? fn : undefined
    this.requestUpdate()
  }

  get renderTag() {
    return this._renderTag
  }
  set renderTag(fn: TagRenderFn | null | undefined) {
    this._renderTag = typeof fn === 'function' ? fn : undefined
    this.requestUpdate()
  }

  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup
  private cleanups: Cleanup[] = []
  private internalValues: string[] = []
  private internalPath: string[] = []
  private defaultsApplied = false

  constructor() {
    super()
    this.nodes = []
    this.placeholder = 'Select'
    this.disabled = false
    this.selectBranches = false
    this.multiple = false
    this.height = 240
    this.columnWidth = 180
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    upgradeProperty(this, 'renderNode')
    upgradeProperty(this, 'renderValue')
    upgradeProperty(this, 'renderTag')
    this.classList.add('ui-tree-select')
    this.startMachine()
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.stopMachine()
    super.disconnectedCallback()
  }

  protected willUpdate() {
    if (!this.defaultsApplied) {
      this.internalValues = normalizeTreeSelectValue(this.defaultValue, this.multiple)
      this.internalPath = resolveTreeSelectPath(this.nodes ?? [], this.defaultExpandedValue ?? [])
      this.defaultsApplied = true
    }
  }

  protected updated() {
    this.bindMachine()
    this.fillCustomSlots()
  }

  private get controlled() {
    return this.value !== undefined
  }

  private get selectedValues(): string[] {
    return this.controlled
      ? normalizeTreeSelectValue(this.value, this.multiple)
      : this.internalValues
  }

  private get activePath(): string[] {
    return resolveTreeSelectPath(this.nodes ?? [], this.expandedValue ?? this.internalPath)
  }

  private startMachine() {
    if (this.service) return
    this.service = new VanillaMachine(popover.machine, {
      id: `h-tree-select-${crypto.randomUUID()}`,
      positioning: {
        placement: 'bottom-start',
        sameWidth: false,
        overflowPadding: 8,
      },
      onOpenChange: () => {
        // Re-bind only (no full re-render of columns unless data changed)
        this.bindMachine()
      },
    })
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.bindMachine())
  }

  private stopMachine() {
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.service?.stop()
    this.service = undefined
  }

  private bindMachine() {
    if (!this.service) return
    this.cleanups.forEach(fn => fn())
    this.cleanups = []
    const api = popover.connect(this.service.service, normalizeProps)
    const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]')
    const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]')
    const content = this.querySelector<HTMLElement>('[data-part="content"]')
    if (trigger) this.cleanups.push(spreadProps(trigger, api.getTriggerProps()))
    if (positioner) this.cleanups.push(spreadProps(positioner, api.getPositionerProps()))
    if (content) this.cleanups.push(spreadProps(content, api.getContentProps()))
  }

  private updatePath(nextPath: string[]) {
    if (this.expandedValue === undefined) this.internalPath = nextPath
    emitDetail(
      this,
      'expanded-change',
      { expandedValue: nextPath } satisfies TreeExpandedChangeDetails,
      this._onExpandedChange,
    )
    this.requestUpdate()
  }

  private emitValue(nextValues: string[]) {
    if (!this.controlled) this.internalValues = nextValues
    const details: TreeSelectValueChangeDetails = {
      value: this.multiple ? nextValues : nextValues[0] ?? '',
      selectedValue: nextValues,
    }
    emitDetail(this, 'value-change', details, this._onValueChange)
    if (!this.multiple && this.service) {
      const api = popover.connect(this.service.service, normalizeProps)
      api.setOpen(false)
    }
    this.requestUpdate()
  }

  private toggleValue(id: string) {
    const selected = this.selectedValues
    const next = selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id]
    this.emitValue(next)
  }

  private handleNodeClick(node: TreeNodeContract, columnIndex: number) {
    const path = this.activePath
    const nextPath = path.slice(0, columnIndex)
    if (node.children?.length) {
      if (this.selectBranches) this.toggleValue(node.id)
      this.updatePath([...nextPath, node.id])
      return
    }
    if (this.multiple) this.toggleValue(node.id)
    else this.emitValue([node.id])
  }

  /** Fill [data-bind] from context on cloned templates / render fn results. */
  private applyBind(root: Element, data: Record<string, unknown>) {
    root.querySelectorAll('[data-bind]').forEach(el => {
      const key = el.getAttribute('data-bind')
      if (!key) return
      const value = data[key]
      el.textContent = value == null ? '' : String(value)
    })
  }

  private getTemplate(slot: string): HTMLTemplateElement | null {
    return this.querySelector(`:scope > template[data-slot="${slot}"]`)
  }

  private fillCustomSlots() {
    // Node labels
    this.querySelectorAll<HTMLElement>('[data-part="node-label"]').forEach(host => {
      const id = host.dataset.nodeId
      const level = Number(host.dataset.level ?? 0)
      if (!id) return
      const node = flattenTreeSelectNodes(this.nodes ?? []).find(n => n.id === id)
      if (!node) return
      const ctx: TreeSelectNodeRenderContext = {
        node,
        level,
        selected: host.dataset.selected === 'true',
        active: host.dataset.active === 'true',
        disabled: host.dataset.disabled === 'true',
        branch: host.dataset.branch === 'true',
        multiple: this.multiple,
      }
      host.replaceChildren()
      if (this._renderNode) {
        const out = this._renderNode(ctx)
        this.appendRenderResult(host, out)
        return
      }
      const tpl = this.getTemplate('node')
      if (tpl) {
        const frag = tpl.content.cloneNode(true) as DocumentFragment
        this.applyBind(frag as unknown as Element, {
          label: node.label,
          id: node.id,
          level,
          selected: ctx.selected,
          active: ctx.active,
          branch: ctx.branch,
        })
        // DocumentFragment isn't Element - walk children
        frag.querySelectorAll('[data-bind]').forEach(el => {
          const key = el.getAttribute('data-bind')
          if (!key) return
          const map: Record<string, unknown> = {
            label: node.label,
            id: node.id,
            level,
            selected: ctx.selected,
            active: ctx.active,
            branch: ctx.branch,
          }
          el.textContent = map[key] == null ? '' : String(map[key])
        })
        host.append(frag)
        return
      }
      host.textContent = node.label
    })

    // Value area (single replace)
    const valueHost = this.querySelector<HTMLElement>('[data-part="value-custom"]')
    if (valueHost) {
      const nodeIndex = new Map(flattenTreeSelectNodes(this.nodes ?? []).map(n => [n.id, n]))
      const selectedNodes = this.selectedValues
        .map(id => nodeIndex.get(id))
        .filter((n): n is TreeNodeContract => Boolean(n))
      const ctx: TreeSelectValueRenderContext = {
        value: this.multiple ? this.selectedValues : this.selectedValues[0] ?? '',
        selectedValue: this.selectedValues,
        selectedNodes,
        multiple: this.multiple,
      }
      valueHost.replaceChildren()
      if (this._renderValue) {
        this.appendRenderResult(valueHost, this._renderValue(ctx))
      } else {
        const tpl = this.getTemplate('value')
        if (tpl) {
          const frag = tpl.content.cloneNode(true) as DocumentFragment
          frag.querySelectorAll('[data-bind]').forEach(el => {
            const key = el.getAttribute('data-bind')
            if (key === 'label') el.textContent = selectedNodes.map(n => n.label).join('、')
            if (key === 'count') el.textContent = String(selectedNodes.length)
          })
          valueHost.append(frag)
        }
      }
    }

    // Tags
    this.querySelectorAll<HTMLElement>('[data-part="tag-custom"]').forEach(host => {
      const id = host.dataset.nodeId
      if (!id) return
      const node = flattenTreeSelectNodes(this.nodes ?? []).find(n => n.id === id)
      if (!node) return
      const ctx = {
        node,
        selectedValue: this.selectedValues,
        multiple: this.multiple,
        onRemove: () => this.toggleValue(node.id),
      }
      host.replaceChildren()
      if (this._renderTag) {
        this.appendRenderResult(host, this._renderTag(ctx))
        return
      }
      const tpl = this.getTemplate('tag')
      if (tpl) {
        const frag = tpl.content.cloneNode(true) as DocumentFragment
        frag.querySelectorAll('[data-bind]').forEach(el => {
          const key = el.getAttribute('data-bind')
          if (key === 'label') el.textContent = node.label
          if (key === 'id') el.textContent = node.id
        })
        frag.querySelectorAll('[data-action="remove"]').forEach(el => {
          el.addEventListener('click', e => {
            e.preventDefault()
            e.stopPropagation()
            this.toggleValue(node.id)
          })
        })
        host.append(frag)
      }
    })
  }

  private appendRenderResult(host: HTMLElement, out: Node | string | null | undefined) {
    if (out == null) return
    if (typeof out === 'string') host.textContent = out
    else host.append(out)
  }

  protected render() {
    const nodes = this.nodes ?? []
    const nodeIndex = new Map(flattenTreeSelectNodes(nodes).map(n => [n.id, n]))
    const selectedValues = this.selectedValues
    const selectedNodes = selectedValues
      .map(id => nodeIndex.get(id))
      .filter((n): n is TreeNodeContract => Boolean(n))
    const activePath = this.activePath
    const columns = resolveTreeSelectColumns(nodes, activePath)
    const menuHeight =
      typeof this.height === 'number' ? `${this.height}px` : String(this.height ?? 240)
    const multiple = this.multiple
    const hasValueSlot = Boolean(this._renderValue || this.getTemplate('value'))
    const hasTagSlot = Boolean(this._renderTag || this.getTemplate('tag'))
    const selectedLabel =
      selectedNodes.map(n => n.label).join(multiple ? '、' : '') || this.placeholder

    if (this.multiple) this.setAttribute('data-multiple', '')
    else this.removeAttribute('data-multiple')

    return html`
      ${this.label ? html`<label class="ui-field__label">${this.label}</label>` : nothing}
      <button
        type="button"
        data-part="trigger"
        class="ui-tree-select__trigger"
        ?disabled=${this.disabled}
        aria-label=${this.label ?? this.placeholder}
        ?data-placeholder-shown=${selectedNodes.length === 0}
      >
        <span class="ui-tree-select__value">
          ${hasValueSlot
            ? html`<span data-part="value-custom"></span>`
            : multiple
              ? html`<span class="ui-tree-select__tags">
                  ${selectedNodes.length === 0
                    ? html`<span class="ui-tree-select__tag-placeholder">${this.placeholder}</span>`
                    : repeat(
                        selectedNodes,
                        n => n.id,
                        node => html`
                          <span class="ui-tree-select__tag" data-node-id=${node.id}>
                            <span class="ui-tree-select__tag-label">
                              ${hasTagSlot
                                ? html`<span
                                    data-part="tag-custom"
                                    data-node-id=${node.id}
                                  ></span>`
                                : node.label}
                            </span>
                            ${!hasTagSlot
                              ? html`<span
                                  class="ui-tree-select__tag-remove"
                                  role="button"
                                  tabindex="0"
                                  aria-label=${`Remove ${node.label}`}
                                  @pointerdown=${(e: Event) => e.stopPropagation()}
                                  @click=${(e: Event) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    this.toggleValue(node.id)
                                  }}
                                >×</span
                              >`
                              : nothing}
                          </span>
                        `,
                      )}
                </span>`
              : selectedLabel}
        </span>
        <span class="ui-tree-select__indicator" aria-hidden="true"></span>
      </button>
      <div data-part="positioner" class="ui-tree-select__positioner">
        <div data-part="content" class="ui-tree-select__content">
          <div
            class="ui-tree-select__panel"
            role="listbox"
            aria-label=${this.label ?? this.placeholder}
            aria-multiselectable=${multiple ? 'true' : nothing}
          >
            ${repeat(
              columns,
              (_, i) => i,
              (column, columnIndex) => {
                const width = resolveTreeSelectColumnWidth(
                  columnIndex,
                  this.columnWidth,
                  this.columnWidths,
                )
                return html`
                  <div
                    class="ui-tree-select__menu"
                    role="group"
                    style="max-height:${menuHeight};width:${width};min-width:${width}"
                  >
                    ${repeat(
                      column,
                      n => n.id,
                      node => {
                        const isBranch = Boolean(node.children?.length)
                        const isActive = activePath[columnIndex] === node.id
                        const isSelected = selectedValues.includes(node.id)
                        return html`
                          <button
                            class="ui-tree-select__node"
                            type="button"
                            role="option"
                            aria-label=${node.label}
                            aria-selected=${isSelected}
                            aria-expanded=${isBranch ? isActive : nothing}
                            ?disabled=${node.disabled}
                            data-active=${isActive ? '' : nothing}
                            data-selected=${isSelected ? '' : nothing}
                            @click=${() => this.handleNodeClick(node, columnIndex)}
                          >
                            <span class="ui-tree-select__radio" aria-hidden="true"></span>
                            <span
                              class="ui-tree-select__node-label"
                              data-part="node-label"
                              data-node-id=${node.id}
                              data-level=${columnIndex}
                              data-selected=${String(isSelected)}
                              data-active=${String(isActive)}
                              data-disabled=${String(Boolean(node.disabled))}
                              data-branch=${String(isBranch)}
                            ></span>
                            ${isBranch
                              ? html`<span
                                  class="ui-tree-select__node-indicator"
                                  aria-hidden="true"
                                ></span>`
                              : nothing}
                          </button>
                        `
                      },
                    )}
                  </div>
                `
              },
            )}
          </div>
        </div>
      </div>
      ${this.name && multiple
        ? repeat(
            selectedValues,
            id => id,
            id => html`<input type="hidden" name=${this.name!} value=${id} readonly />`,
          )
        : this.name
          ? html`<input
              type="hidden"
              name=${this.name}
              value=${selectedValues[0] ?? ''}
              readonly
            />`
          : nothing}
    `
  }
}

function upgradeProperty(host: HTMLElement, name: string) {
  if (!Object.prototype.hasOwnProperty.call(host, name)) return
  const value = (host as HTMLElement & Record<string, unknown>)[name]
  delete (host as HTMLElement & Record<string, unknown>)[name]
  ;(host as HTMLElement & Record<string, unknown>)[name] = value
}

export type HTreeSelectProps = TreeSelectContract
defineOnce('h-tree-select', HTreeSelect)
