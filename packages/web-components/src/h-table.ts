import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import {
  DragDropManager,
  Feedback,
  KeyboardSensor,
  PointerActivationConstraints,
  PointerSensor,
} from '@dnd-kit/dom'
import { Sortable, isSortableOperation } from '@dnd-kit/dom/sortable'
import {
  TableController,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/lit-table'
import type {
  TableCellType,
  TableColumnAlign,
  TableColumnContract,
  TableColumnOrderChangeDetails,
  TableColumnOrderState,
  TableColumnSizingChangeDetails,
  TableColumnSizingState,
  TableDensity,
  TableExpandedChangeDetails,
  TableExpandedState,
  TablePaginationChangeDetails,
  TablePaginationState,
  TableRowData,
  TableSortingChangeDetails,
  TableSortingState,
  TableContract,
} from '@demo/ui-core'
import {
  defineOnce,
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

function toTanstackSorting(sorting?: TableSortingState): SortingState {
  return (sorting ?? []).map(item => ({ id: item.id, desc: item.desc }))
}
function fromTanstackSorting(sorting: SortingState): TableSortingState {
  return sorting.map(item => ({ id: item.id, desc: item.desc }))
}
function applyUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater
}
function toCoreExpanded(expanded: ExpandedState): TableExpandedState {
  return expanded === true ? true : { ...expanded }
}
function toColumnPinning(columns: TableColumnContract[], includeExpander = false): ColumnPinningState {
  const left = [
    ...(includeExpander ? ['__expand'] : []),
    ...columns.filter(c => c.pinned === 'left').map(c => c.id ?? c.accessorKey),
  ]
  const right = columns.filter(c => c.pinned === 'right').map(c => c.id ?? c.accessorKey)
  return { left, right }
}

function toneFromStatus(raw: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const v = raw.toLowerCase()
  if (['active', 'online', 'done', 'success', 'pass', 'healthy', 'low'].some(k => v.includes(k)))
    return 'success'
  if (['away', 'pending', 'warn', 'hold', 'idle', 'medium', 'high'].some(k => v.includes(k)))
    return 'warning'
  if (['offline', 'error', 'fail', 'blocked', 'critical'].some(k => v.includes(k))) return 'danger'
  if (['info', 'new', 'review'].some(k => v.includes(k))) return 'info'
  return 'neutral'
}

function defaultAlign(column: TableColumnContract, fallback: TableColumnAlign = 'left'): TableColumnAlign {
  return column.textAlign ?? column.align ?? fallback
}

function renderCellContent(
  value: unknown,
  cellType: TableCellType,
  align: TableColumnAlign,
): TemplateResult {
  const className = ['ui-table__cell', `ui-table__cell--${cellType}`, `ui-table__cell--align-${align}`].join(
    ' ',
  )
  if (value == null || value === '') return html`<span class=${className}>—</span>`
  switch (cellType) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      return html`<span class=${className}
        >${Number.isFinite(n) ? n.toLocaleString() : String(value)}</span
      >`
    }
    case 'tag': {
      const text = String(value)
      return html`<span class=${className}
        ><span class=${`ui-tag ui-tag--${toneFromStatus(text)}`}>${text}</span></span
      >`
    }
    case 'badge': {
      const text = String(value)
      return html`<span class=${className}
        ><span class=${`ui-badge ui-badge--${toneFromStatus(text)}`}>${text}</span></span
      >`
    }
    case 'progress': {
      const n = typeof value === 'number' ? value : Number(value)
      const safe = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
      return html`<span class=${className}>
        <span class="ui-table__progress-wrap">
          <span class="ui-progress">
            <span class="ui-progress__track">
              <span class="ui-progress__range" style=${`width:${safe}%`}></span>
            </span>
          </span>
          <span class="ui-table__progress-label">${safe}%</span>
        </span>
      </span>`
    }
    case 'datetime': {
      const d = value instanceof Date ? value : new Date(String(value))
      const text = Number.isNaN(d.getTime())
        ? String(value)
        : d.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
      return html`<span class=${className}>${text}</span>`
    }
    case 'boolean': {
      const on = value === true || value === 'true' || value === 1 || value === '1'
      return html`<span class=${className}
        ><span class=${`ui-tag ui-tag--${on ? 'success' : 'neutral'}`}
          >${on ? 'Yes' : 'No'}</span
        ></span
      >`
    }
    default:
      return html`<span class=${className}>${String(value)}</span>`
  }
}

type ExpandedRenderFn = (row: { id: string; original: TableRowData }) => Node | string | TemplateResult | null

/**
 * Lit + TanStack table aligned with React HTable feature set:
 * sort, page, pin, resize, column order (@dnd-kit/dom), and Presence-backed expand.
 * Expanded detail: `renderExpanded` property or `<template data-slot="expanded">`.
 */
export class HTable extends LitElement {
  static properties = {
    columns: { type: Array, converter: jsonConverter },
    data: { type: Array, converter: jsonConverter },
    fillHeight: { type: Boolean, attribute: 'fill-height' },
    enableSorting: { type: Boolean, attribute: 'enable-sorting' },
    sorting: { converter: jsonConverter },
    defaultSorting: { attribute: 'default-sorting', converter: jsonConverter },
    enablePagination: { type: Boolean, attribute: 'enable-pagination' },
    pageSize: { type: Number, attribute: 'page-size' },
    pagination: { converter: jsonConverter },
    defaultPagination: { attribute: 'default-pagination', converter: jsonConverter },
    padEmptyRows: {
      attribute: 'pad-empty-rows',
      converter: {
        fromAttribute(value: string | null) {
          if (value === null) return undefined
          if (value === 'false' || value === '0') return false
          return true
        },
        toAttribute(value: boolean | undefined) {
          if (value === undefined) return null
          return value ? '' : 'false'
        },
      },
    },
    density: { type: String },
    textAlign: { type: String, attribute: 'text-align' },
    emptyText: { type: String, attribute: 'empty-text' },
    loading: { type: Boolean },
    caption: { type: String },
    resizeable: { type: Boolean },
    enableColumnResizing: { type: Boolean, attribute: 'enable-column-resizing' },
    columnResizeMode: { type: String, attribute: 'column-resize-mode' },
    columnSizing: { converter: jsonConverter },
    defaultColumnSizing: { attribute: 'default-column-sizing', converter: jsonConverter },
    draggable: { type: Boolean },
    enableColumnOrdering: { type: Boolean, attribute: 'enable-column-ordering' },
    columnOrder: { converter: jsonConverter },
    defaultColumnOrder: { attribute: 'default-column-order', converter: jsonConverter },
    enableExpanding: { type: Boolean, attribute: 'enable-expanding' },
    lazyMount: { type: Boolean, attribute: 'lazy-mount' },
    unmountOnExit: { type: Boolean, attribute: 'unmount-on-exit' },
    expanded: { converter: jsonConverter },
    defaultExpanded: { attribute: 'default-expanded', converter: jsonConverter },
  }

  declare columns: TableColumnContract[]
  declare data: TableRowData[]
  declare fillHeight: boolean
  declare enableSorting: boolean
  declare sorting: TableSortingState | undefined
  declare defaultSorting: TableSortingState | undefined
  declare enablePagination: boolean
  declare pageSize: number
  declare pagination: TablePaginationState | undefined
  declare defaultPagination: TablePaginationState | undefined
  declare padEmptyRows: boolean | undefined
  declare density: TableDensity
  declare textAlign: TableColumnAlign
  declare emptyText: string
  declare loading: boolean
  declare caption: string | undefined
  declare resizeable: boolean
  declare enableColumnResizing: boolean
  declare columnResizeMode: 'onChange' | 'onEnd'
  declare columnSizing: TableColumnSizingState | undefined
  declare defaultColumnSizing: TableColumnSizingState | undefined
  declare draggable: boolean
  declare enableColumnOrdering: boolean
  declare columnOrder: TableColumnOrderState | undefined
  declare defaultColumnOrder: TableColumnOrderState | undefined
  declare enableExpanding: boolean
  declare lazyMount: boolean
  declare unmountOnExit: boolean
  declare expanded: TableExpandedState | undefined
  declare defaultExpanded: TableExpandedState | undefined

  private _onSortingChange?: DetailHandler<TableSortingChangeDetails>
  private _onPaginationChange?: DetailHandler<TablePaginationChangeDetails>
  private _onColumnSizingChange?: DetailHandler<TableColumnSizingChangeDetails>
  private _onColumnOrderChange?: DetailHandler<TableColumnOrderChangeDetails>
  private _onExpandedChange?: DetailHandler<TableExpandedChangeDetails>
  private _renderExpanded?: ExpandedRenderFn
  private _getRowCanExpand?: (row: TableRowData) => boolean

  get onSortingChange() {
    return this._onSortingChange
  }
  set onSortingChange(handler: DetailHandler<TableSortingChangeDetails> | null | undefined) {
    this._onSortingChange = asDetailHandler(handler)
  }
  get onPaginationChange() {
    return this._onPaginationChange
  }
  set onPaginationChange(handler: DetailHandler<TablePaginationChangeDetails> | null | undefined) {
    this._onPaginationChange = asDetailHandler(handler)
  }
  get onColumnSizingChange() {
    return this._onColumnSizingChange
  }
  set onColumnSizingChange(handler: DetailHandler<TableColumnSizingChangeDetails> | null | undefined) {
    this._onColumnSizingChange = asDetailHandler(handler)
  }
  get onColumnOrderChange() {
    return this._onColumnOrderChange
  }
  set onColumnOrderChange(handler: DetailHandler<TableColumnOrderChangeDetails> | null | undefined) {
    this._onColumnOrderChange = asDetailHandler(handler)
  }
  get onExpandedChange() {
    return this._onExpandedChange
  }
  set onExpandedChange(handler: DetailHandler<TableExpandedChangeDetails> | null | undefined) {
    this._onExpandedChange = asDetailHandler(handler)
  }
  get renderExpanded() {
    return this._renderExpanded
  }
  set renderExpanded(fn: ExpandedRenderFn | null | undefined) {
    this._renderExpanded = typeof fn === 'function' ? fn : undefined
    this.requestUpdate()
  }
  get getRowCanExpand() {
    return this._getRowCanExpand
  }
  set getRowCanExpand(fn: ((row: TableRowData) => boolean) | null | undefined) {
    this._getRowCanExpand = typeof fn === 'function' ? fn : undefined
    this.requestUpdate()
  }

  private tableController = new TableController<TableRowData>(this)
  private _sorting: SortingState = []
  private _pagination: PaginationState = { pageIndex: 0, pageSize: 10 }
  private _columnSizing: ColumnSizingState = {}
  private _columnOrder: ColumnOrderState = []
  private _expanded: ExpandedState = {}
  private _columnPinning: ColumnPinningState = { left: [], right: [] }
  private defaultsApplied = false
  private dragSourceId: string | null = null
  private suppressSortClick = false
  private _expandedMounts = new Set<string>()
  private _unmountedExpandedRows = new Set<string>()
  private _exitTimers = new Map<string, number>()
  private dndManager: DragDropManager | null = null
  private dndSortables = new Map<string, Sortable>()
  private dndCleanups: Array<() => void> = []
  private dndInitialOrder: string[] = []
  private dndColumnWidths = new Map<string, number>()
  private dndOverColumnId: string | null = null
  private dndDeltaX = 0

  constructor() {
    super()
    this.columns = []
    this.data = []
    this.fillHeight = false
    this.enableSorting = true
    this.enablePagination = false
    this.pageSize = 10
    this.padEmptyRows = undefined
    this.density = 'comfortable'
    this.textAlign = 'left'
    this.emptyText = 'No data'
    this.loading = false
    this.resizeable = false
    this.enableColumnResizing = false
    this.columnResizeMode = 'onChange'
    this.draggable = false
    this.enableColumnOrdering = false
    this.enableExpanding = false
    this.lazyMount = true
    this.unmountOnExit = false
    this.initializeDnd()
  }

  protected createRenderRoot() {
    return this
  }

  disconnectedCallback() {
    this.destroyDnd()
    for (const timer of this._exitTimers.values()) window.clearTimeout(timer)
    this._exitTimers.clear()
    super.disconnectedCallback()
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.upgradeRenderExpanded()
    this.classList.add('ui-table')
    super.connectedCallback()
    this.initializeDnd()
    this.syncDndSortables()
  }

  private initializeDnd() {
    if (this.dndManager) return
    this.dndManager = new DragDropManager({
      sensors: [
        PointerSensor.configure({
          activationConstraints: [new PointerActivationConstraints.Distance({ value: 6 })],
        }),
        KeyboardSensor,
      ],
    })
    this.dndCleanups = [
      this.dndManager.monitor.addEventListener('dragstart', event => {
        const source = event.operation.source
        if (!source) return
        this.dragSourceId = String(source.id)
        this.dndInitialOrder = this.getDndColumnIds()
        this.dndOverColumnId = null
        this.dndDeltaX = 0
        this.dndColumnWidths = new Map(
          this.getDndHeaders().map(header => [header.dataset.columnId ?? '', header.getBoundingClientRect().width]),
        )
        this.suppressSortClick = true
        this.setDndHeaderState()
      }),
      this.dndManager.monitor.addEventListener('dragmove', event => {
        this.dndDeltaX = event.by?.x ?? 0
        this.applyDndBodyTransforms()
      }),
      this.dndManager.monitor.addEventListener('dragover', event => {
        const targetId = event.operation.target?.id
        this.dndOverColumnId = targetId == null ? null : String(targetId)
        this.setDndHeaderState()
        this.applyDndBodyTransforms()
      }),
      this.dndManager.monitor.addEventListener('dragend', event => {
        this.dragSourceId = null
        this.dndOverColumnId = null
        this.dndDeltaX = 0
        this.clearDndBodyTransforms()
        this.setDndHeaderState()
        if (!event.canceled && isSortableOperation(event.operation) && event.operation.source) {
          this.moveDndColumn(
            event.operation.source.sortable,
            event.operation.target?.sortable ?? null,
          )
        }
        this.requestUpdate()
      }),
    ]
  }

  private destroyDnd() {
    for (const cleanup of this.dndCleanups) cleanup()
    this.dndCleanups = []
    for (const sortable of this.dndSortables.values()) sortable.destroy()
    this.dndSortables.clear()
    this.dndManager?.destroy()
    this.dndManager = null
    this.clearDndBodyTransforms()
    this.dragSourceId = null
    this.dndOverColumnId = null
    this.dndInitialOrder = []
    this.dndColumnWidths.clear()
  }

  private upgradeRenderExpanded() {
    if (!Object.prototype.hasOwnProperty.call(this, 'renderExpanded')) return
    const value = (this as HTMLElement & { renderExpanded?: ExpandedRenderFn }).renderExpanded
    delete (this as HTMLElement & { renderExpanded?: ExpandedRenderFn }).renderExpanded
    this.renderExpanded = value
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    const shouldExpand = this.enableExpanding || Boolean(this._renderExpanded || this.querySelector('template[data-slot="expanded"]'))

    if (!this.defaultsApplied) {
      this._sorting = toTanstackSorting(this.defaultSorting)
      this._pagination = {
        pageIndex: this.defaultPagination?.pageIndex ?? 0,
        pageSize: this.defaultPagination?.pageSize ?? this.pageSize ?? 10,
      }
      this._columnSizing = { ...(this.defaultColumnSizing ?? {}) }
      this._columnOrder = [...(this.defaultColumnOrder ?? [])]
      this._expanded = this.defaultExpanded ?? {}
      this._columnPinning = toColumnPinning(this.columns ?? [], shouldExpand)
      this.defaultsApplied = true
    }

    if (changed.has('sorting') && this.sorting !== undefined) {
      this._sorting = toTanstackSorting(this.sorting)
    }
    if (changed.has('pagination') && this.pagination !== undefined) {
      this._pagination = { pageIndex: this.pagination.pageIndex, pageSize: this.pagination.pageSize }
    }
    if (changed.has('pageSize') && this.pagination === undefined) {
      this._pagination = { ...this._pagination, pageSize: this.pageSize || 10 }
    }
    if (changed.has('columnSizing') && this.columnSizing !== undefined) {
      this._columnSizing = { ...this.columnSizing }
    }
    if (changed.has('columnOrder') && this.columnOrder !== undefined) {
      this._columnOrder = [...this.columnOrder]
    }
    if (changed.has('expanded') && this.expanded !== undefined) {
      this._expanded = this.expanded
    }
    if (changed.has('columns') || changed.has('enableExpanding')) {
      this._columnPinning = toColumnPinning(this.columns ?? [], shouldExpand)
    }

    this.classList.toggle('ui-table--comfortable', this.density !== 'compact')
    this.classList.toggle('ui-table--compact', this.density === 'compact')
    this.classList.toggle('ui-table--fill-height', this.fillHeight)
    this.classList.toggle('ui-table--animated-expansion', shouldExpand)
  }

  protected updated() {
    this.fillExpandedSlots()
    this.syncDndSortables()
  }

  private get shouldResize() {
    return this.resizeable || this.enableColumnResizing
  }
  private get shouldDrag() {
    return this.draggable || this.enableColumnOrdering
  }
  private get shouldExpand() {
    return this.enableExpanding || Boolean(this._renderExpanded || this.querySelector('template[data-slot="expanded"]'))
  }

  private getDndHeaders() {
    return Array.from(
      this.querySelectorAll<HTMLElement>(
        ':scope > .ui-table__scroll > table > thead > tr > th[data-column-orderable="true"]',
      ),
    )
  }

  private getDndColumnIds() {
    return this.getDndHeaders()
      .map(header => header.dataset.columnId)
      .filter((id): id is string => Boolean(id))
  }

  private setDndHeaderState() {
    this.querySelectorAll<HTMLElement>('th[data-column-id]').forEach(header => {
      const id = header.dataset.columnId
      header.classList.toggle('ui-table__th--dragging', id === this.dragSourceId)
      header.classList.toggle('ui-table__th--drag-over', id === this.dndOverColumnId)
    })
  }

  private getDndBodyOffsets() {
    if (!this.dragSourceId || this.dndInitialOrder.length === 0) return new Map<string, number>()
    const sourceIndex = this.dndInitialOrder.indexOf(this.dragSourceId)
    const targetIndex = this.dndOverColumnId ? this.dndInitialOrder.indexOf(this.dndOverColumnId) : -1
    if (sourceIndex < 0) return new Map<string, number>()
    const previewIds = [...this.dndInitialOrder]
    if (targetIndex >= 0 && targetIndex !== sourceIndex) {
      const [sourceId] = previewIds.splice(sourceIndex, 1)
      previewIds.splice(targetIndex, 0, sourceId)
    }
    const originalStarts = new Map<string, number>()
    const previewStarts = new Map<string, number>()
    let originalStart = 0
    for (const id of this.dndInitialOrder) {
      originalStarts.set(id, originalStart)
      originalStart += this.dndColumnWidths.get(id) ?? 0
    }
    let previewStart = 0
    for (const id of previewIds) {
      previewStarts.set(id, previewStart)
      previewStart += this.dndColumnWidths.get(id) ?? 0
    }
    return new Map(this.dndInitialOrder.map(id => [
      id,
      id === this.dragSourceId
        ? this.dndDeltaX
        : (previewStarts.get(id) ?? 0) - (originalStarts.get(id) ?? 0),
    ]))
  }

  private applyDndBodyTransforms() {
    const offsets = this.getDndBodyOffsets()
    this.querySelectorAll<HTMLElement>('td[data-column-id]').forEach(cell => {
      const id = cell.dataset.columnId
      const offset = id ? offsets.get(id) : undefined
      if (offset === undefined || offset === 0) {
        cell.style.removeProperty('transform')
        cell.style.removeProperty('transition')
        cell.style.removeProperty('position')
        cell.style.removeProperty('z-index')
        return
      }
      cell.style.transform = `translate3d(${offset}px, 0, 0)`
      cell.style.transition = 'transform var(--ui-table-column-move-duration, 180ms) var(--ui-table-column-move-easing, ease)'
      if (id === this.dragSourceId) {
        cell.style.position = 'relative'
        cell.style.zIndex = '2'
      }
    })
  }

  private clearDndBodyTransforms() {
    this.querySelectorAll<HTMLElement>('td[data-column-id]').forEach(cell => {
      cell.style.removeProperty('transform')
      cell.style.removeProperty('transition')
      cell.style.removeProperty('position')
      cell.style.removeProperty('z-index')
    })
    this.dndColumnWidths.clear()
    this.dndInitialOrder = []
  }

  private syncDndSortables() {
    const activeIds = new Set<string>()
    const manager = this.dndManager
    // The rendered header attribute is the source of truth here. This keeps
    // sortables restorable when the element is reconnected before Lit has
    // re-applied the boolean `draggable` property.
    if (manager) {
      for (const [index, header] of this.getDndHeaders().entries()) {
        const id = header.dataset.columnId
        const handle = header.querySelector<HTMLElement>('.ui-table__drag-activator')
        if (!id || !handle) continue
        activeIds.add(id)
        const current = this.dndSortables.get(id)
        if (current) {
          current.element = header
          current.handle = handle
          current.index = index
          current.disabled = false
        } else {
          this.dndSortables.set(
            id,
            new Sortable(
              {
                id,
                index,
                group: 'ui-table-columns',
                element: header,
                handle,
                plugins: defaults => [
                  ...defaults,
                  Feedback.configure({ feedback: 'clone', dropAnimation: null }),
                ],
                transition: { idle: true },
              },
              manager,
            ),
          )
        }
      }
    }

    for (const [id, sortable] of this.dndSortables) {
      if (activeIds.has(id)) continue
      sortable.destroy()
      this.dndSortables.delete(id)
    }
  }

  private moveDndColumn(source: Sortable, target: Sortable | null) {
    if (!target) return
    const ids = this.dndInitialOrder.length ? this.dndInitialOrder : this.getDndColumnIds()
    const from = source.initialIndex
    const to = source.index
    if (from < 0 || to < 0 || from >= ids.length || to >= ids.length || from === to) return
    const next = [...ids]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    this._columnOrder = next
    emitDetail(this, 'column-order-change', { order: [...next] }, this._onColumnOrderChange)
  }

  private isExpandedDetailMounted(rowId: string, open: boolean) {
    if (open) {
      this._unmountedExpandedRows.delete(rowId)
      this._expandedMounts.add(rowId)
      return true
    }
    if (this._unmountedExpandedRows.has(rowId)) return false
    if (!this.lazyMount || this._expandedMounts.has(rowId)) {
      this._expandedMounts.add(rowId)
      return true
    }
    return false
  }

  private scheduleExpandedUnmount(rowId: string) {
    if (!this.unmountOnExit) return
    const current = this._exitTimers.get(rowId)
    if (current !== undefined) window.clearTimeout(current)
    const timer = window.setTimeout(() => {
      this._expandedMounts.delete(rowId)
      this._unmountedExpandedRows.add(rowId)
      this._exitTimers.delete(rowId)
      this.requestUpdate()
    }, 180)
    this._exitTimers.set(rowId, timer)
  }

  private cancelExpandedUnmount(rowId: string) {
    const timer = this._exitTimers.get(rowId)
    if (timer !== undefined) {
      window.clearTimeout(timer)
      this._exitTimers.delete(rowId)
    }
  }

  private fillExpandedSlots() {
    this.querySelectorAll<HTMLElement>('[data-part="expanded-host"]').forEach(host => {
      const rowId = host.dataset.rowId
      if (!rowId) return
      const original = (() => {
        try {
          return JSON.parse(host.dataset.rowJson || '{}') as TableRowData
        } catch {
          return {} as TableRowData
        }
      })()
      host.replaceChildren()
      if (this._renderExpanded) {
        const out = this._renderExpanded({ id: rowId, original })
        if (out == null) return
        if (typeof out === 'string') host.textContent = out
        else if (out instanceof Node) host.append(out)
        else host.append(document.createTextNode(String(out)))
        return
      }
      const tpl = this.querySelector(':scope > template[data-slot="expanded"]') as HTMLTemplateElement | null
      if (tpl) {
        const frag = tpl.content.cloneNode(true) as DocumentFragment
        frag.querySelectorAll('[data-bind]').forEach(el => {
          const key = el.getAttribute('data-bind')
          if (!key) return
          const v = original[key]
          el.textContent = v == null ? '' : String(v)
        })
        host.append(frag)
        return
      }
      host.textContent = JSON.stringify(original)
    })
  }

  protected render() {
    const columnContracts = this.columns ?? []
    const shouldExpand = this.shouldExpand
    const shouldResize = this.shouldResize
    const shouldDrag = this.shouldDrag
    const enableSorting = this.enableSorting !== false
    const enablePagination = Boolean(this.enablePagination)
    const shouldPad = this.padEmptyRows ?? enablePagination

    const dataColumns: ColumnDef<TableRowData>[] = columnContracts.map(column => {
      const align = defaultAlign(column, this.textAlign ?? 'left')
      const cellType: TableCellType = column.cellType ?? 'text'
      return {
        id: column.id ?? column.accessorKey,
        accessorKey: column.accessorKey,
        header: column.header,
        ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
        size: column.size,
        minSize: column.minSize,
        maxSize: column.maxSize,
        ...(column.enableResizing === undefined ? {} : { enableResizing: column.enableResizing }),
        meta: { align, cellType, enableOrdering: column.enableOrdering },
        cell: info => renderCellContent(info.getValue(), cellType, align),
      }
    })

    const columns: ColumnDef<TableRowData>[] = shouldExpand
      ? [
          {
            id: '__expand',
            header: '',
            size: 48,
            minSize: 48,
            enableSorting: false,
            enableResizing: false,
            meta: { align: 'center', enableOrdering: false },
            cell: ({ row }) => row,
          },
          ...dataColumns,
        ]
      : dataColumns

    const table = this.tableController.table({
      data: this.data ?? [],
      columns,
      state: {
        sorting: this._sorting,
        columnPinning: this._columnPinning,
        ...(shouldResize ? { columnSizing: this._columnSizing } : {}),
        ...(shouldDrag ? { columnOrder: this._columnOrder } : {}),
        ...(enablePagination ? { pagination: this._pagination } : {}),
        ...(shouldExpand ? { expanded: this._expanded } : {}),
      },
      onSortingChange: updater => {
        this._sorting = applyUpdater(updater, this._sorting)
        emitDetail(this, 'sorting-change', { sorting: fromTanstackSorting(this._sorting) }, this._onSortingChange)
        this.requestUpdate()
      },
      onPaginationChange: enablePagination
        ? updater => {
            this._pagination = applyUpdater(updater, this._pagination)
            emitDetail(
              this,
              'pagination-change',
              {
                pagination: {
                  pageIndex: this._pagination.pageIndex,
                  pageSize: this._pagination.pageSize,
                } satisfies TablePaginationState,
              },
              this._onPaginationChange,
            )
            this.requestUpdate()
          }
        : undefined,
      onColumnSizingChange: shouldResize
        ? updater => {
            this._columnSizing = applyUpdater(updater, this._columnSizing)
            emitDetail(this, 'column-sizing-change', { sizing: { ...this._columnSizing } }, this._onColumnSizingChange)
            this.requestUpdate()
          }
        : undefined,
      onColumnOrderChange: shouldDrag
        ? updater => {
            this._columnOrder = applyUpdater(updater, this._columnOrder)
            emitDetail(this, 'column-order-change', { order: [...this._columnOrder] }, this._onColumnOrderChange)
            this.requestUpdate()
          }
        : undefined,
      onExpandedChange: shouldExpand
        ? updater => {
            this._expanded = applyUpdater(updater, this._expanded)
            for (const row of table.getRowModel().rows) {
              const open = this._expanded === true || Boolean(this._expanded[row.id])
              if (open) {
                this.cancelExpandedUnmount(row.id)
                this._unmountedExpandedRows.delete(row.id)
                this._expandedMounts.add(row.id)
              } else {
                this.scheduleExpandedUnmount(row.id)
              }
            }
            emitDetail(
              this,
              'expanded-change',
              { expanded: toCoreExpanded(this._expanded) },
              this._onExpandedChange,
            )
            this.requestUpdate()
          }
        : undefined,
      getSubRows: row => (Array.isArray(row.subRows) ? (row.subRows as TableRowData[]) : undefined),
      getRowCanExpand: row => {
        if (this._getRowCanExpand) return this._getRowCanExpand(row.original)
        return shouldExpand || Boolean(row.subRows?.length)
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
      getExpandedRowModel: shouldExpand ? getExpandedRowModel() : undefined,
      enableSorting,
      enableColumnResizing: shouldResize,
      columnResizeMode: this.columnResizeMode ?? 'onChange',
      defaultColumn: { size: 150, minSize: 40, maxSize: 1200 },
      enableExpanding: shouldExpand,
      autoResetPageIndex: false,
    })

    const rows = table.getRowModel().rows
    const headerGroups = table.getHeaderGroups()
    const colCount = Math.max(columns.length, 1)
    const pageCount = table.getPageCount()
    const totalRows = table.getFilteredRowModel().rows.length
    const pageSize = enablePagination ? table.getState().pagination.pageSize : rows.length
    const padCount =
      shouldPad && enablePagination && !this.loading ? Math.max(0, pageSize - rows.length) : 0
    const leafHeaders = headerGroups[headerGroups.length - 1]?.headers ?? []

    const isOrderable = (header: (typeof leafHeaders)[number]) => {
      const meta = header.column.columnDef.meta as { enableOrdering?: boolean } | undefined
      return (
        shouldDrag &&
        header.column.id !== '__expand' &&
        !header.column.getIsPinned() &&
        meta?.enableOrdering !== false
      )
    }

    const pinnedStyle = (column: {
      getIsPinned: () => false | 'left' | 'right'
      getStart: (p: 'left' | 'right') => number
      getAfter: (p: 'left' | 'right') => number
      getIsFirstColumn: (p?: 'left' | 'right' | 'center') => boolean
      getIsLastColumn: (p?: 'left' | 'right' | 'center') => boolean
    }) => {
      const pinned = column.getIsPinned()
      if (!pinned) return { className: '', style: '', dataPinned: nothing, dataPinnedEdge: nothing }
      const offset = pinned === 'left' ? column.getStart('left') : column.getAfter('right')
      const style =
        pinned === 'left'
          ? `position:sticky;z-index:2;left:${offset}px`
          : `position:sticky;z-index:2;right:${offset}px`
      return {
        className: `ui-table__cell--pinned-${pinned}`,
        style,
        dataPinned: pinned,
        dataPinnedEdge: column.getIsFirstColumn(pinned)
          ? 'start'
          : column.getIsLastColumn(pinned)
            ? 'end'
            : nothing,
      }
    }

    return html`
      ${this.caption ? html`<div class="ui-table__caption">${this.caption}</div>` : nothing}
      <div class="ui-table__scroll">
        <table class="ui-table__table">
          <colgroup>
            ${repeat(
              leafHeaders,
              h => h.id,
              h => html`<col style=${`width:${h.column.getSize()}px`} />`,
            )}
          </colgroup>
          <thead class="ui-table__thead">
            ${repeat(
              headerGroups,
              group => group.id,
              group => html`
                <tr class="ui-table__tr ui-table__tr--head">
                  ${repeat(
                    group.headers,
                    header => header.id,
                    header => {
                      const canSort = enableSorting && header.column.getCanSort()
                      const canResize = shouldResize && header.column.getCanResize()
                      const canOrder = isOrderable(header)
                      const sorted = header.column.getIsSorted()
                      const align =
                        (header.column.columnDef.meta as { align?: string } | undefined)?.align ??
                        'left'
                      const pin = pinnedStyle(header.column)
                      const classes = [
                        'ui-table__th',
                        `ui-table__th--align-${align}`,
                        pin.className,
                        canSort ? 'ui-table__th--sortable' : '',
                        canOrder ? 'ui-table__th--draggable' : '',
                        this.dragSourceId === header.column.id ? 'ui-table__th--dragging' : '',
                        sorted === 'asc' ? 'ui-table__th--sorted-asc' : '',
                        sorted === 'desc' ? 'ui-table__th--sorted-desc' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                      const size = header.column.getSize()
                      const minSize = header.column.columnDef.minSize
                      const maxSize = header.column.columnDef.maxSize
                      const styleParts = [
                        pin.style,
                        size ? `width:${size}px` : '',
                        minSize ? `min-width:${minSize}px` : '',
                        maxSize ? `max-width:${maxSize}px` : '',
                      ]
                        .filter(Boolean)
                        .join(';')
                      const onSort = header.column.getToggleSortingHandler()
                      return html`
                        <th
                          class=${classes}
                          style=${styleParts || nothing}
                          data-pinned=${pin.dataPinned}
                          data-pinned-edge=${pin.dataPinnedEdge}
                          data-column-id=${header.column.id}
                          data-column-orderable=${canOrder ? 'true' : nothing}
                          @click=${canSort
                            ? (event: Event) => {
                                if (this.suppressSortClick) {
                                  this.suppressSortClick = false
                                  event.preventDefault()
                                  event.stopPropagation()
                                  return
                                }
                                onSort?.(event)
                              }
                            : nothing}
                        >
                          <span
                            class="ui-table__drag-activator"
                          >
                          <span class="ui-table__th-inner">
                            ${header.isPlaceholder
                              ? nothing
                              : flexRender(header.column.columnDef.header, header.getContext())}
                            ${canSort
                              ? html`<span class="ui-table__sort-indicator" aria-hidden="true"
                                  >${sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}</span
                                >`
                              : nothing}
                          </span>
                          </span>
                          ${canResize
                            ? html`<span
                                class="ui-table__resize-handle"
                                role="separator"
                                aria-orientation="vertical"
                                aria-label="Resize column"
                                @pointerdown=${(e: Event) => e.stopPropagation()}
                                @mousedown=${(e: Event) => {
                                  header.getResizeHandler()?.(e)
                                }}
                                 @touchstart=${(e: Event) => {
                                   header.getResizeHandler()?.(e)
                                 }}
                                 @click=${(e: Event) => e.stopPropagation()}
                               ></span>`
                            : nothing}
                        </th>
                      `
                    },
                  )}
                </tr>
              `,
            )}
          </thead>
          <tbody class="ui-table__tbody">
            ${this.loading
              ? html`<tr class="ui-table__tr">
                  <td class="ui-table__td ui-table__td--empty" colspan=${colCount}>Loading…</td>
                </tr>`
              : rows.length === 0
                ? html`<tr class="ui-table__tr">
                    <td class="ui-table__td ui-table__td--empty" colspan=${colCount}>
                      ${this.emptyText}
                    </td>
                  </tr>`
                : html`
                    ${repeat(
                      rows,
                      row => row.id,
                      row => html`
                        <tr class="ui-table__tr">
                          ${repeat(
                            row.getVisibleCells(),
                            cell => cell.id,
                            cell => {
                              const align =
                                (cell.column.columnDef.meta as { align?: string } | undefined)
                                  ?.align ?? 'left'
                              const pin = pinnedStyle(cell.column)
                              if (cell.column.id === '__expand') {
                                return html`
                                  <td
                                    class=${['ui-table__td', `ui-table__td--align-${align}`, pin.className]
                                      .filter(Boolean)
                                      .join(' ')}
                                    style=${pin.style || nothing}
                                    data-pinned=${pin.dataPinned}
                                    data-pinned-edge=${pin.dataPinnedEdge}
                                    data-column-id=${cell.column.id}
                                  >
                                    ${row.getCanExpand()
                                      ? html`<button
                                          type="button"
                                          class="ui-table__expand-trigger"
                                          aria-label=${row.getIsExpanded()
                                            ? 'Collapse row'
                                            : 'Expand row'}
                                          aria-expanded=${row.getIsExpanded()}
                                          @click=${() => {
                                            row.getToggleExpandedHandler()()
                                            this.requestUpdate()
                                          }}
                                        >
                                          ${row.getIsExpanded() ? '▾' : '▸'}
                                        </button>`
                                      : nothing}
                                  </td>
                                `
                              }
                              return html`
                                <td
                                  class=${['ui-table__td', `ui-table__td--align-${align}`, pin.className]
                                    .filter(Boolean)
                                    .join(' ')}
                                  style=${pin.style || nothing}
                                  data-pinned=${pin.dataPinned}
                                  data-pinned-edge=${pin.dataPinnedEdge}
                                  data-column-id=${cell.column.id}
                                >
                                  ${flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              `
                            },
                          )}
                        </tr>
                        ${shouldExpand && row.getCanExpand() && (row.getIsExpanded() || this.isExpandedDetailMounted(row.id, false))
                          ? html`
                              <tr
                                class="ui-table__tr ui-table__tr--expanded"
                                data-expanded=${row.getIsExpanded() ? 'true' : 'false'}
                                aria-hidden=${row.getIsExpanded() ? 'false' : 'true'}
                              >
                                <td class="ui-table__td ui-table__td--expanded" colspan=${colCount}>
                                  <div
                                    class="ui-table__expanded-presence"
                                    data-state=${row.getIsExpanded() ? 'open' : 'closed'}
                                  >
                                    <div
                                      class="ui-table__expanded-presence-inner"
                                      data-part="expanded-host"
                                      data-row-id=${row.id}
                                      data-row-json=${JSON.stringify(row.original)}
                                    ></div>
                                  </div>
                                </td>
                              </tr>
                            `
                          : nothing}
                      `,
                    )}
                    ${padCount > 0
                      ? repeat(
                          Array.from({ length: padCount }, (_, i) => i),
                          i => `pad-${i}`,
                          () => html`
                            <tr class="ui-table__tr ui-table__tr--pad" aria-hidden="true">
                              ${repeat(
                                Array.from({ length: colCount }, (_, i) => i),
                                i => i,
                                () => html`<td class="ui-table__td ui-table__td--pad"></td>`,
                              )}
                            </tr>
                          `,
                        )
                      : nothing}
                  `}
          </tbody>
        </table>
      </div>
      ${enablePagination
        ? html`
            <div class="ui-table__pagination">
              <button
                type="button"
                class="ui-table__page-btn"
                ?disabled=${!table.getCanPreviousPage()}
                @click=${() => {
                  table.previousPage()
                }}
              >
                Prev
              </button>
              <span class="ui-table__page-info">
                Page ${table.getState().pagination.pageIndex + 1} / ${Math.max(pageCount, 1)} ·
                ${totalRows} rows
              </span>
              <button
                type="button"
                class="ui-table__page-btn"
                ?disabled=${!table.getCanNextPage()}
                @click=${() => {
                  table.nextPage()
                }}
              >
                Next
              </button>
            </div>
          `
        : nothing}
    `
  }
}

export type HTableProps = TableContract & {
  /** Optional adapter escape hatch for row-specific expansion eligibility. */
  getRowCanExpand?: (row: TableRowData) => boolean
  /** Optional property callback; use a template[data-slot="expanded"] for declarative markup. */
  renderExpanded?: ExpandedRenderFn
}
defineOnce('h-table', HTable)
