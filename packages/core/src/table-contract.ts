/**
 * HTable public contract (TanStack Table under the hood).
 *
 * Core stays framework-agnostic and serializable enough for WC attributes:
 * - columns: accessorKey + header + optional cellType (no render functions)
 * - data: plain row records
 * - sorting / pagination as explicit state for MeshFlow-friendly control
 *
 * Custom ColumnDef.cell renderers remain React/Vue-only escape hatches
 * via HTableProps, not this Core contract.
 */

export type TableCellType =
  | 'text'
  | 'number'
  | 'tag'
  | 'badge'
  | 'progress'
  | 'datetime'
  | 'boolean'

export type TableColumnAlign = 'left' | 'center' | 'right'

export interface TableColumnContract {
  /** Column id; defaults to accessorKey when omitted. */
  id?: string
  /** Dot-path key into each row object. */
  accessorKey: string
  /** Header label. */
  header: string
  /** When false, column cannot be sorted. Default true if table enableSorting. */
  enableSorting?: boolean
  /** Optional fixed width hint (px). Prefer for stable layout. */
  size?: number
  /** Min width hint (px). */
  minSize?: number
  /** Cell presentation hint (serializable; works on WC too). Default text. */
  cellType?: TableCellType
  /** Horizontal alignment. */
  align?: TableColumnAlign
}

export interface TableSortItem {
  id: string
  desc: boolean
}

export type TableSortingState = TableSortItem[]

export interface TableSortingChangeDetails {
  sorting: TableSortingState
}

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
}

export interface TablePaginationChangeDetails {
  pagination: TablePaginationState
}

export type TableSortingChangeHandler = (details: TableSortingChangeDetails) => void
export type TablePaginationChangeHandler = (details: TablePaginationChangeDetails) => void

/**
 * Row data is intentionally untyped at Core (Record).
 * React/Vue can narrow via generics at the HTableProps layer if needed.
 */
export type TableRowData = Record<string, unknown>

export type TableDensity = 'compact' | 'comfortable'

export interface TableContract {
  columns: TableColumnContract[]
  data: TableRowData[]

  /** Client-side sorting. Default true. */
  enableSorting?: boolean
  /** Controlled sorting; omit for uncontrolled (initial empty). */
  sorting?: TableSortingState
  defaultSorting?: TableSortingState
  onSortingChange?: TableSortingChangeHandler

  /** Client-side pagination. Default false (show all rows). */
  enablePagination?: boolean
  pageSize?: number
  pagination?: TablePaginationState
  defaultPagination?: TablePaginationState
  onPaginationChange?: TablePaginationChangeHandler

  /**
   * When paginated, pad body with empty rows to keep table height stable.
   * Default true when enablePagination is on.
   */
  padEmptyRows?: boolean

  /** Row density / fixed row height token. Default comfortable. */
  density?: TableDensity

  /** Empty / loading affordances */
  emptyText?: string
  loading?: boolean

  /** Optional caption / title above table */
  caption?: string
}
