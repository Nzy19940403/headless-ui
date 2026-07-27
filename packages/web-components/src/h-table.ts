import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import {
  TableController,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/lit-table'
import type {
  TableCellType,
  TableColumnAlign,
  TableColumnContract,
  TableDensity,
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

function defaultAlign(column: TableColumnContract): TableColumnAlign {
  if (column.align) return column.align
  if (column.cellType === 'number' || column.cellType === 'progress') return 'right'
  return 'left'
}

/** Serializable cell renderer for WC (no framework components). */
function renderCellContent(
  value: unknown,
  cellType: TableCellType,
  align: TableColumnAlign,
): TemplateResult {
  const className = ['ui-table__cell', `ui-table__cell--${cellType}`, `ui-table__cell--align-${align}`].join(
    ' ',
  )

  if (value == null || value === '') {
    return html`<span class=${className}>—</span>`
  }

  switch (cellType) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      return html`<span class=${className}
        >${Number.isFinite(n) ? n.toLocaleString() : String(value)}</span
      >`
    }
    case 'tag': {
      const text = String(value)
      const tone = toneFromStatus(text)
      return html`<span class=${className}
        ><span class=${`ui-tag ui-tag--${tone}`}>${text}</span></span
      >`
    }
    case 'badge': {
      const text = String(value)
      const tone = toneFromStatus(text)
      return html`<span class=${className}
        ><span class=${`ui-badge ui-badge--${tone}`}>${text}</span></span
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
    case 'text':
    default:
      return html`<span class=${className}>${String(value)}</span>`
  }
}

/**
 * Lit shell over `@tanstack/lit-table` TableController.
 * State follows official Lit table-state guide: local fields + state/onChange pair.
 */
export class HTable extends LitElement {
  static properties = {
    columns: { type: Array, converter: jsonConverter },
    data: { type: Array, converter: jsonConverter },
    enableSorting: { type: Boolean, attribute: 'enable-sorting' },
    sorting: { converter: jsonConverter },
    defaultSorting: { attribute: 'default-sorting', converter: jsonConverter },
    enablePagination: { type: Boolean, attribute: 'enable-pagination' },
    pageSize: { type: Number, attribute: 'page-size' },
    pagination: { converter: jsonConverter },
    defaultPagination: { attribute: 'default-pagination', converter: jsonConverter },
    // Custom converter: absent attribute → undefined (default = enablePagination)
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
    emptyText: { type: String, attribute: 'empty-text' },
    loading: { type: Boolean },
    caption: { type: String },
  }

  declare columns: TableColumnContract[]
  declare data: TableRowData[]
  declare enableSorting: boolean
  declare sorting: TableSortingState | undefined
  declare defaultSorting: TableSortingState | undefined
  declare enablePagination: boolean
  declare pageSize: number
  declare pagination: TablePaginationState | undefined
  declare defaultPagination: TablePaginationState | undefined
  /** Reflect: when attribute absent, leave undefined so default = enablePagination. */
  declare padEmptyRows: boolean | undefined
  declare density: TableDensity
  declare emptyText: string
  declare loading: boolean
  declare caption: string | undefined

  private _onSortingChange?: DetailHandler<TableSortingChangeDetails>
  private _onPaginationChange?: DetailHandler<TablePaginationChangeDetails>

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

  private tableController = new TableController<TableRowData>(this)

  /** Local adapter state (Lit-reactive via requestUpdate) */
  private _sorting: SortingState = []
  private _pagination: PaginationState = { pageIndex: 0, pageSize: 10 }
  private defaultsApplied = false

  constructor() {
    super()
    this.columns = []
    this.data = []
    this.enableSorting = true
    this.enablePagination = false
    this.pageSize = 10
    this.padEmptyRows = undefined
    this.density = 'comfortable'
    this.emptyText = 'No data'
    this.loading = false
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-table')
    super.connectedCallback()
  }

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (!this.defaultsApplied) {
      this._sorting = toTanstackSorting(this.defaultSorting)
      this._pagination = {
        pageIndex: this.defaultPagination?.pageIndex ?? 0,
        pageSize: this.defaultPagination?.pageSize ?? this.pageSize ?? 10,
      }
      this.defaultsApplied = true
    }

    if (changed.has('sorting') && this.sorting !== undefined) {
      this._sorting = toTanstackSorting(this.sorting)
    }
    if (changed.has('pagination') && this.pagination !== undefined) {
      this._pagination = {
        pageIndex: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
      }
    }
    if (changed.has('pageSize') && this.pagination === undefined) {
      this._pagination = { ...this._pagination, pageSize: this.pageSize || 10 }
    }

    // Density class on host
    this.classList.toggle('ui-table--comfortable', this.density !== 'compact')
    this.classList.toggle('ui-table--compact', this.density === 'compact')
  }

  protected render() {
    const columns: ColumnDef<TableRowData>[] = (this.columns ?? []).map(column => {
      const align = defaultAlign(column)
      const cellType: TableCellType = column.cellType ?? 'text'
      return {
        id: column.id ?? column.accessorKey,
        accessorKey: column.accessorKey,
        header: column.header,
        ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
        size: column.size,
        minSize: column.minSize,
        meta: { align, cellType },
        cell: info => renderCellContent(info.getValue(), cellType, align),
      }
    })

    const enableSorting = this.enableSorting !== false
    const enablePagination = Boolean(this.enablePagination)
    const shouldPad = this.padEmptyRows ?? enablePagination

    const table = this.tableController.table({
      data: this.data ?? [],
      columns,
      state: {
        sorting: this._sorting,
        ...(enablePagination ? { pagination: this._pagination } : {}),
      },
      onSortingChange: updater => {
        this._sorting = applyUpdater(updater, this._sorting)
        emitDetail(
          this,
          'sorting-change',
          { sorting: fromTanstackSorting(this._sorting) },
          this._onSortingChange,
        )
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
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
      enableSorting,
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

    return html`
      ${this.caption ? html`<div class="ui-table__caption">${this.caption}</div>` : nothing}
      <div class="ui-table__scroll">
        <table class="ui-table__table">
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
                      const sorted = header.column.getIsSorted()
                      const align =
                        (header.column.columnDef.meta as { align?: string } | undefined)?.align ??
                        'left'
                      const classes = [
                        'ui-table__th',
                        `ui-table__th--align-${align}`,
                        canSort ? 'ui-table__th--sortable' : '',
                        sorted === 'asc' ? 'ui-table__th--sorted-asc' : '',
                        sorted === 'desc' ? 'ui-table__th--sorted-desc' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                      const onSort = header.column.getToggleSortingHandler()
                      const size = header.column.getSize()
                      const minSize = header.column.columnDef.minSize
                      const styleParts = [
                        size ? `width:${size}px` : '',
                        minSize ? `min-width:${minSize}px` : '',
                      ]
                        .filter(Boolean)
                        .join(';')
                      return html`
                        <th
                          class=${classes}
                          style=${styleParts || nothing}
                          @click=${canSort
                            ? (event: Event) => {
                                onSort?.(event)
                              }
                            : nothing}
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
                              return html`
                                <td class=${['ui-table__td', `ui-table__td--align-${align}`].join(' ')}>
                                  ${flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              `
                            },
                          )}
                        </tr>
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

export type HTableProps = TableContract
defineOnce('h-table', HTable)
