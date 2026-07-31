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
export type TableColumnPin = 'left' | 'right'

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
  /** Max width enforced by column resizing (px). */
  maxSize?: number
  /** Allow this column to be resized. Default follows table setting. */
  enableResizing?: boolean
  /** Allow this column to be reordered by the header drag interaction. */
  enableOrdering?: boolean
  /** Cell presentation hint (serializable; works on WC too). Default text. */
  cellType?: TableCellType
  /** Horizontal alignment. */
  align?: TableColumnAlign
  /** Explicit text alignment; takes precedence over the legacy `align` alias. */
  textAlign?: TableColumnAlign
  /** Keep this column visible while the table scrolls horizontally. */
  pinned?: TableColumnPin
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

export type TableColumnSizingState = Record<string, number>

export interface TableColumnSizingChangeDetails {
  sizing: TableColumnSizingState
}

export type TableColumnOrderState = string[]

export interface TableColumnOrderChangeDetails {
  order: TableColumnOrderState
}

export type TableExpandedState = true | Record<string, boolean>

export interface TableExpandedChangeDetails {
  expanded: TableExpandedState
}

export type TableSortingChangeHandler = (details: TableSortingChangeDetails) => void
export type TablePaginationChangeHandler = (details: TablePaginationChangeDetails) => void
export type TableColumnSizingChangeHandler = (details: TableColumnSizingChangeDetails) => void
export type TableColumnOrderChangeHandler = (details: TableColumnOrderChangeDetails) => void
export type TableExpandedChangeHandler = (details: TableExpandedChangeDetails) => void

/**
 * Row data is intentionally untyped at Core (Record).
 * React/Vue can narrow via generics at the HTableProps layer if needed.
 */
export type TableRowData = Record<string, unknown>

export type TableDensity = 'compact' | 'comfortable'

export interface TableContract {
  columns: TableColumnContract[]
  data: TableRowData[]

  /** Make the table consume the block-size offered by its parent layout. */
  fillHeight?: boolean

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

  /** Enable header column resizing. Default false. */
  resizeable?: boolean
  /** @deprecated Use resizeable. Kept as a compatibility alias for adapters already using the TanStack name. */
  enableColumnResizing?: boolean
  /** Apply resize state continuously or only after the pointer is released. */
  columnResizeMode?: 'onChange' | 'onEnd'
  columnSizing?: TableColumnSizingState
  defaultColumnSizing?: TableColumnSizingState
  onColumnSizingChange?: TableColumnSizingChangeHandler

  /** Enable header drag-and-drop column ordering. Default false. */
  draggable?: boolean
  /** @deprecated Use draggable. Kept as a compatibility alias for adapters already using the TanStack name. */
  enableColumnOrdering?: boolean
  columnOrder?: TableColumnOrderState
  defaultColumnOrder?: TableColumnOrderState
  onColumnOrderChange?: TableColumnOrderChangeHandler

  /** Enable an expander column and TanStack's expanded row model. */
  enableExpanding?: boolean
  /** Mount expanded detail content only after the first expansion. */
  lazyMount?: boolean
  /** Remove expanded detail content after its exit transition completes. */
  unmountOnExit?: boolean
  /** Controlled expanded state; omit for uncontrolled behavior. */
  expanded?: TableExpandedState
  defaultExpanded?: TableExpandedState
  onExpandedChange?: TableExpandedChangeHandler

  /**
   * When paginated, pad body with empty rows to keep table height stable.
   * Default true when enablePagination is on.
   */
  padEmptyRows?: boolean

  /** Row density / fixed row height token. Default comfortable. */
  density?: TableDensity

  /** Default text alignment for all columns. Column `textAlign` overrides it. */
  textAlign?: TableColumnAlign

  /** Empty / loading affordances */
  emptyText?: string
  loading?: boolean

  /** Optional caption / title above table */
  caption?: string
}
