import { Children, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type ThHTMLAttributes } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragMoveEvent,
  type Modifier,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type Row,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import type {
  TableContract,
  TableExpandedState,
  TablePaginationState,
  TableRowData,
  TableSortingState,
  PresenceContract,
} from '@demo/ui-core'
import { renderTableCell } from './table-cells'
import { Presence } from '@ark-ui/react/presence'

export interface HTableProps extends TableContract, Pick<PresenceContract, 'lazyMount' | 'unmountOnExit'> {
  /** React escape hatch for fully custom TanStack columns. */
  columnDefs?: ColumnDef<TableRowData, any>[]
  /** Render a detail row below an expanded data row. */
  renderExpanded?: (row: Row<TableRowData>) => ReactNode
  /** Optional predicate for rows that can expand. Defaults to every row when enabled. */
  getRowCanExpand?: (row: TableRowData) => boolean
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

function toColumnPinning(columns: TableContract['columns'], includeExpander = false): ColumnPinningState {
  const left = [
    ...(includeExpander ? ['__expand'] : []),
    ...columns.filter(column => column.pinned === 'left').map(column => column.id ?? column.accessorKey),
  ]
  const right = columns.filter(column => column.pinned === 'right').map(column => column.id ?? column.accessorKey)
  return { left, right }
}

function toCoreExpanded(expanded: ExpandedState): TableExpandedState {
  return expanded === true ? true : { ...expanded }
}

function pinnedProps(column: {
  getIsPinned: () => false | 'left' | 'right'
  getStart: (position: 'left' | 'right') => number
  getAfter: (position: 'left' | 'right') => number
  getIsFirstColumn: (position?: 'left' | 'right' | 'center') => boolean
  getIsLastColumn: (position?: 'left' | 'right' | 'center') => boolean
}) {
  const pinned = column.getIsPinned()
  if (!pinned) return { className: '', style: {} as CSSProperties, dataPinned: undefined as undefined, dataPinnedEdge: undefined as undefined }

  const offset = pinned === 'left' ? column.getStart('left') : column.getAfter('right')
  const style: CSSProperties = {
    position: 'sticky',
    zIndex: 2,
    ...(pinned === 'left' ? { left: offset } : { right: offset }),
  }
  return {
    className: `ui-table__cell--pinned-${pinned}`,
    style,
    dataPinned: pinned,
    dataPinnedEdge: column.getIsFirstColumn(pinned) ? 'start' : column.getIsLastColumn(pinned) ? 'end' : undefined,
  }
}

function pinnedBodyStyle(pin: ReturnType<typeof pinnedProps>): CSSProperties {
  if (!pin.dataPinned) return {}

  const sideShadow = pin.dataPinned === 'left'
    ? '1px 0 0 var(--ui-color-hairline)'
    : '-1px 0 0 var(--ui-color-hairline)'

  return {
    // Body cells use the same inset bottom rule as non-pinned cells so the
    // separate-border table keeps one consistent row rule.
    boxShadow: `inset 0 -1px 0 var(--ui-color-hairline), ${sideShadow}`,
  }
}


/** TanStack-backed table with serializable sorting, pagination, pinning and expansion state. */
export function HTable({
  columns: columnContracts,
  columnDefs,
  data,
  fillHeight = false,
  enableSorting = true,
  sorting: sortingProp,
  defaultSorting = [],
  onSortingChange,
  enablePagination = false,
  pageSize = 10,
  pagination: paginationProp,
  defaultPagination,
  onPaginationChange,
  resizeable,
  draggable,
  enableColumnResizing = false,
  columnResizeMode = 'onChange',
  columnSizing: columnSizingProp,
  defaultColumnSizing = {},
  onColumnSizingChange,
  enableColumnOrdering = false,
  columnOrder: columnOrderProp,
  defaultColumnOrder = [],
  onColumnOrderChange,
  enableExpanding = false,
  lazyMount = true,
  unmountOnExit = false,
  expanded: expandedProp,
  defaultExpanded = {},
  onExpandedChange,
  padEmptyRows,
  density = 'comfortable',
  textAlign = 'left',
  emptyText = 'No data',
  loading = false,
  caption,
  renderExpanded,
  getRowCanExpand,
}: HTableProps) {
  const shouldResize = resizeable ?? enableColumnResizing
  const shouldDragColumns = draggable ?? enableColumnOrdering
  const shouldPad = padEmptyRows ?? enablePagination
  const shouldExpand = enableExpanding || Boolean(renderExpanded)

  const [sorting, setSorting] = useState<SortingState>(() => toTanstackSorting(defaultSorting))
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: defaultPagination?.pageIndex ?? 0,
    pageSize: defaultPagination?.pageSize ?? pageSize,
  }))
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpanded)
  const expandedRef = useRef<ExpandedState>(defaultExpanded)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(defaultColumnSizing)
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const tableRootRef = useRef<HTMLDivElement>(null)
  const draggedColumnIdRef = useRef<string | null>(null)
  const dragOverColumnIdRef = useRef<string | null>(null)
  const dragDeltaXRef = useRef(0)
  const dragFrameRef = useRef<number | null>(null)
  const pendingDragDeltaRef = useRef(0)
  const dragHeaderRectRef = useRef<DOMRect | null>(null)
  const suppressSortClickRef = useRef(false)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /** Keep the dragged header/overlay inside the table's horizontal viewport. */
  const restrictColumnDragToViewport = useMemo<Modifier>(
    () => ({
      transform,
      draggingNodeRect,
    }) => {
      const draggingRect = draggingNodeRect
      const tableEl = tableRootRef.current
      if (!draggingRect || !tableEl) return transform

      const scrollContainer = tableEl.querySelector('.ui-table__scroll') as HTMLElement | null
      const viewportRect = (scrollContainer || tableEl).getBoundingClientRect()

      const minX = viewportRect.left - draggingRect.left
      const maxX = viewportRect.right - draggingRect.right

      return {
        ...transform,
        x: Math.min(maxX, Math.max(minX, transform.x)),
      }
    },
    [],
  )
  const defaultColumnPinning = useMemo(
    () => toColumnPinning(columnContracts, shouldExpand),
    [columnContracts, shouldExpand],
  )
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(defaultColumnPinning)

  useEffect(() => {
    if (sortingProp !== undefined) setSorting(toTanstackSorting(sortingProp))
  }, [sortingProp])
  useEffect(() => {
    if (paginationProp !== undefined) setPagination(paginationProp)
  }, [paginationProp])
  useEffect(() => {
    if (columnSizingProp !== undefined) setColumnSizing(columnSizingProp)
  }, [columnSizingProp])
  useEffect(() => {
    if (columnOrderProp !== undefined) setColumnOrder(columnOrderProp)
  }, [columnOrderProp])
  useEffect(() => {
    if (paginationProp === undefined) {
      setPagination(prev => (prev.pageSize === pageSize ? prev : { ...prev, pageSize }))
    }
  }, [pageSize, paginationProp])
  useEffect(() => {
    if (expandedProp !== undefined) {
      expandedRef.current = expandedProp
      setExpanded(expandedProp)
    }
  }, [expandedProp])
  useEffect(() => {
    setColumnPinning(defaultColumnPinning)
  }, [defaultColumnPinning])

  const dataColumns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (columnDefs?.length) {
      return columnDefs.map(column => {
        const accessorKey = 'accessorKey' in column && typeof column.accessorKey === 'string' ? column.accessorKey : undefined
        const id = column.id ?? accessorKey
        const contract = id ? columnContracts.find(item => (item.id ?? item.accessorKey) === id) : undefined
        return {
          ...column,
          size: column.size ?? contract?.size,
          minSize: column.minSize ?? contract?.minSize,
          maxSize: column.maxSize ?? contract?.maxSize,
          enableResizing: column.enableResizing ?? contract?.enableResizing,
          enableSorting: column.enableSorting ?? contract?.enableSorting,
          meta: {
            align: contract?.textAlign ?? contract?.align ?? textAlign,
            cellType: contract?.cellType ?? 'text',
            enableOrdering: contract?.enableOrdering,
            ...column.meta,
          },
        }
      })
    }
    return columnContracts.map(column => ({
      id: column.id ?? column.accessorKey,
      accessorKey: column.accessorKey,
      header: column.header,
      ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
      size: column.size,
      minSize: column.minSize,
      maxSize: column.maxSize,
      ...(column.enableResizing === undefined ? {} : { enableResizing: column.enableResizing }),
      meta: {
        align: column.textAlign ?? column.align ?? textAlign,
        cellType: column.cellType ?? 'text',
        enableOrdering: column.enableOrdering,
      },
      cell: info => renderTableCell(info, column.cellType ?? 'text', column.textAlign ?? column.align ?? textAlign),
    }))
  }, [columnContracts, columnDefs])

  const columns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (!shouldExpand) return dataColumns
    const expander: ColumnDef<TableRowData> = {
      id: '__expand',
      header: () => null,
      size: 48,
      minSize: 48,
      enableSorting: false,
      enableResizing: false,
      meta: { align: 'center' },
      cell: ({ row }) => {
        if (!row.getCanExpand()) return null
        return (
          <button
            type="button"
            className="ui-table__expand-trigger"
            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
            aria-expanded={row.getIsExpanded()}
            onClick={row.getToggleExpandedHandler()}
          >
            {row.getIsExpanded() ? '▾' : '▸'}
          </button>
        )
      },
    }
    return [expander, ...dataColumns]
  }, [dataColumns, shouldExpand])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnPinning,
      ...(shouldResize ? { columnSizing } : {}),
      ...(shouldDragColumns ? { columnOrder } : {}),
      ...(enablePagination ? { pagination } : {}),
      ...(shouldExpand ? { expanded } : {}),
    },
    onSortingChange: updater => {
      const next = applyUpdater(updater, sorting)
      setSorting(next)
      onSortingChange?.({ sorting: fromTanstackSorting(next) })
    },
    onPaginationChange: enablePagination
      ? updater => {
          const next = applyUpdater(updater, pagination)
          setPagination(next)
          onPaginationChange?.({ pagination: { pageIndex: next.pageIndex, pageSize: next.pageSize } satisfies TablePaginationState })
        }
      : undefined,
    onColumnSizingChange: shouldResize
      ? updater => {
          const next = applyUpdater(updater, columnSizing)
          setColumnSizing(next)
          onColumnSizingChange?.({ sizing: next })
        }
      : undefined,
    onColumnOrderChange: shouldDragColumns
      ? updater => {
          const next = applyUpdater(updater, columnOrder)
          setColumnOrder(next)
          onColumnOrderChange?.({ order: next })
        }
      : undefined,
    onExpandedChange: shouldExpand
      ? updater => {
          // TanStack may deliver an updater after another render has already
          // happened. Read the latest value instead of a stale render closure.
          const next = applyUpdater(updater, expandedRef.current)
          expandedRef.current = next
          setExpanded(next)
          onExpandedChange?.({ expanded: toCoreExpanded(next) })
        }
      : undefined,
    getSubRows: row => (Array.isArray(row.subRows) ? (row.subRows as TableRowData[]) : undefined),
    getRowCanExpand: row => {
      if (getRowCanExpand) return getRowCanExpand(row.original)
      return shouldExpand || Boolean(row.subRows?.length)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: shouldExpand ? getExpandedRowModel() : undefined,
    enableSorting,
    enableColumnResizing: shouldResize,
    columnResizeMode,
    defaultColumn: { size: 150, minSize: 40, maxSize: 1200 },
    enableExpanding: shouldExpand,
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const colCount = Math.max(columns.length, 1)
  const currentPageSize = enablePagination ? table.getState().pagination.pageSize : rows.length
  const padCount = shouldPad && enablePagination && !loading ? Math.max(0, currentPageSize - rows.length) : 0
  const leafHeaders = table.getHeaderGroups()[table.getHeaderGroups().length - 1]?.headers ?? []

  function isOrderable(header: any) {
    const meta = header.column.columnDef.meta as { enableOrdering?: boolean } | undefined
    return shouldDragColumns && header.column.id !== '__expand' && !header.column.getIsPinned() && meta?.enableOrdering !== false
  }

  function moveColumn(sourceId: string, targetId: string) {
    const centerIds = table.getCenterLeafColumns().map(column => column.id)
    const sourceIndex = centerIds.indexOf(sourceId)
    const targetIndex = centerIds.indexOf(targetId)
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return

    table.setColumnOrder(arrayMove(centerIds, sourceIndex, targetIndex))
  }

  function setDragOverHeader(targetId: string | null) {
    const root = tableRootRef.current
    if (!root) return

    root.querySelectorAll<HTMLElement>('thead th[data-column-id]').forEach(header => {
      header.classList.toggle(
        'ui-table__th--drag-over',
        Boolean(targetId && header.dataset.columnId === targetId),
      )
    })
  }

  function applyBodyColumnMovePreview(targetId: string | null) {
    const root = tableRootRef.current
    const sourceId = draggedColumnIdRef.current
    if (!root || !sourceId) return

    const centerColumns = table.getCenterLeafColumns()
    const centerIds = centerColumns.map(column => column.id)
    const sourceIndex = centerIds.indexOf(sourceId)
    const targetIndex = targetId ? centerIds.indexOf(targetId) : -1
    if (sourceIndex < 0) return

    const previewIds = targetIndex >= 0 && targetIndex !== sourceIndex
      ? arrayMove(centerIds, sourceIndex, targetIndex)
      : centerIds
    const sizes = new Map(centerColumns.map(column => [column.id, column.getSize()]))
    const originalStarts = new Map<string, number>()
    const previewStarts = new Map<string, number>()
    let originalStart = 0
    for (const id of centerIds) {
      originalStarts.set(id, originalStart)
      originalStart += sizes.get(id) ?? 0
    }
    let previewStart = 0
    for (const id of previewIds) {
      previewStarts.set(id, previewStart)
      previewStart += sizes.get(id) ?? 0
    }

    root.querySelectorAll<HTMLElement>('tbody td[data-column-id]').forEach(cell => {
      const id = cell.dataset.columnId
      if (!id || id === sourceId || !originalStarts.has(id)) return

      const offset = (previewStarts.get(id) ?? 0) - (originalStarts.get(id) ?? 0)
      if (offset === 0) {
        cell.style.removeProperty('transform')
        cell.style.removeProperty('transition')
      } else {
        cell.style.transform = `translate3d(${offset}px, 0, 0)`
        cell.style.transition = 'transform var(--ui-table-column-move-duration, 180ms) var(--ui-table-column-move-easing, ease)'
      }
    })
  }

  function clearBodyColumnMovePreview() {
    tableRootRef.current?.querySelectorAll<HTMLElement>('tbody td[data-column-id]').forEach(cell => {
      cell.style.removeProperty('transform')
      cell.style.removeProperty('transition')
    })
  }

  function handleDragStart({ active }: { active: { id: UniqueIdentifier } }) {
    const id = String(active.id)
    suppressSortClickRef.current = true
    draggedColumnIdRef.current = id
    dragOverColumnIdRef.current = null
    setDragOverHeader(null)
    clearBodyColumnMovePreview()
    setDraggedColumnId(id)
    dragDeltaXRef.current = 0
    dragHeaderRectRef.current = null
    tableRootRef.current?.style.setProperty('--ui-table-drag-delta-x', '0px')

    // Capture the dragged header's initial bounding rect for viewport clamping
    const headerEl = tableRootRef.current?.querySelector<HTMLElement>(
      `[data-column-id="${globalThis.CSS.escape(id)}"]`,
    )
    if (headerEl) {
      dragHeaderRectRef.current = headerEl.getBoundingClientRect()
    }
  }

  function clampDragDeltaX(delta: number): number {
    if (!dragHeaderRectRef.current || !tableRootRef.current) return delta

    const scrollContainer = tableRootRef.current.querySelector<HTMLElement>('.ui-table__scroll')
    const viewportRect = (scrollContainer || tableRootRef.current).getBoundingClientRect()

    const minX = viewportRect.left - dragHeaderRectRef.current.left
    const maxX = viewportRect.right - dragHeaderRectRef.current.right

    return Math.min(maxX, Math.max(minX, delta))
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    // Keep pointer-move work outside React's render path. Re-rendering the
    // whole TanStack table on every pointer event makes the drag feel sticky.
    pendingDragDeltaRef.current = clampDragDeltaX(delta.x)
    if (dragFrameRef.current !== null) return
    dragFrameRef.current = window.requestAnimationFrame(() => {
      dragFrameRef.current = null
      dragDeltaXRef.current = pendingDragDeltaRef.current
      tableRootRef.current?.style.setProperty(
        '--ui-table-drag-delta-x',
        `${dragDeltaXRef.current}px`,
      )
    })
  }

  function handleDragOver({ over }: DragOverEvent) {
    const targetId = over ? String(over.id) : null
    if (dragOverColumnIdRef.current === targetId) return

    dragOverColumnIdRef.current = targetId
    setDragOverHeader(targetId)
    applyBodyColumnMovePreview(targetId)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) moveColumn(String(active.id), String(over.id))
    clearBodyColumnMovePreview()
    setDragOverHeader(null)
    draggedColumnIdRef.current = null
    dragOverColumnIdRef.current = null
    setDraggedColumnId(null)
    clearDragDelta()
  }

  function handleDragCancel() {
    clearBodyColumnMovePreview()
    setDragOverHeader(null)
    draggedColumnIdRef.current = null
    dragOverColumnIdRef.current = null
    setDraggedColumnId(null)
    clearDragDelta()
  }

  function clearDragDelta() {
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current)
      dragFrameRef.current = null
    }
    dragDeltaXRef.current = 0
    pendingDragDeltaRef.current = 0
    tableRootRef.current?.style.setProperty('--ui-table-drag-delta-x', '0px')
  }

  return (
    <div ref={tableRootRef} className={['ui-table', `ui-table--${density}`, fillHeight ? 'ui-table--fill-height' : '', shouldExpand ? 'ui-table--animated-expansion' : ''].filter(Boolean).join(' ')}>
      {caption ? <div className="ui-table__caption">{caption}</div> : null}
      <div className="ui-table__scroll">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictColumnDragToViewport]}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={table.getCenterLeafColumns()
              .filter(column => (column.columnDef.meta as { enableOrdering?: boolean } | undefined)?.enableOrdering !== false)
              .map(column => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            <table className="ui-table__table">
          <colgroup>
            {leafHeaders.map(header => (
              <col key={header.id} style={{ width: header.column.getSize() }} />
            ))}
          </colgroup>
          <thead className="ui-table__thead">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="ui-table__tr ui-table__tr--head">
                {headerGroup.headers.map(header => {
                  const canSort = enableSorting && header.column.getCanSort()
                  const canResize = shouldResize && header.column.getCanResize()
                  const canOrder = isOrderable(header)
                  const sorted = header.column.getIsSorted()
                  const align = (header.column.columnDef.meta as { align?: string } | undefined)?.align ?? 'left'
                  const pin = pinnedProps(header.column)
                  const isDragging = draggedColumnId === header.column.id
                  return (
                    <SortableHeaderCell
                      key={header.id}
                      id={header.column.id}
                      disabled={!canOrder}
                      className={['ui-table__th', `ui-table__th--align-${align}`, pin.className, canSort ? 'ui-table__th--sortable' : '', canOrder ? 'ui-table__th--draggable' : '', isDragging ? 'ui-table__th--dragging' : '', sorted === 'asc' ? 'ui-table__th--sorted-asc' : '', sorted === 'desc' ? 'ui-table__th--sorted-desc' : ''].filter(Boolean).join(' ')}
                      style={{ ...pin.style, width: header.column.getSize() || undefined, minWidth: header.column.columnDef.minSize || undefined, maxWidth: header.column.columnDef.maxSize || undefined }}
                      data-pinned={pin.dataPinned}
                      data-pinned-edge={pin.dataPinnedEdge}
                      data-column-id={header.column.id}
                      data-column-orderable={canOrder ? 'true' : undefined}
                      onClick={canSort ? event => {
                        if (suppressSortClickRef.current) {
                          suppressSortClickRef.current = false
                          event.preventDefault()
                          event.stopPropagation()
                          return
                        }
                        header.column.getToggleSortingHandler()?.(event)
                      } : undefined}
                    >
                      <span className="ui-table__th-inner">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort ? <span className="ui-table__sort-indicator" aria-hidden>{sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}</span> : null}
                      </span>
                      {canResize ? (
                        <span
                          className="ui-table__resize-handle"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label="Resize column"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          onPointerDown={event => event.stopPropagation()}
                          onClick={event => event.stopPropagation()}
                        />
                      ) : null}
                    </SortableHeaderCell>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="ui-table__tbody">
            {loading ? (
              <tr className="ui-table__tr"><td className="ui-table__td ui-table__td--empty" colSpan={colCount}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr className="ui-table__tr"><td className="ui-table__td ui-table__td--empty" colSpan={colCount}>{emptyText}</td></tr>
            ) : (
              <>
                {rows.map(row => (
                  <ReactRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    colCount={colCount}
                    renderExpanded={renderExpanded ?? (enableExpanding ? row => <pre className="ui-table__expanded-fallback">{JSON.stringify(row.original)}</pre> : undefined)}
                    lazyMount={lazyMount}
                    unmountOnExit={unmountOnExit}
                    draggedColumnId={draggedColumnId}
                  />
                ))}
                {Array.from({ length: padCount }).map((_, index) => (
                  <tr key={`pad-${index}`} className="ui-table__tr ui-table__tr--pad" aria-hidden>
                    {columns.map((_, colIndex) => <td key={colIndex} className="ui-table__td ui-table__td--pad" />)}
                  </tr>
                ))}
              </>
            )}
          </tbody>
            </table>
            <DragOverlay dropAnimation={null}>
              {draggedColumnId ? (() => {
                const header = leafHeaders.find(item => item.column.id === draggedColumnId)
                if (!header) return null
                return (
                  <div className="ui-table__drag-overlay" style={{ width: header.column.getSize() }}>
                    <span className="ui-table__th-inner">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  </div>
                )
              })() : null}
            </DragOverlay>
          </SortableContext>
        </DndContext>
      </div>
      {enablePagination ? (
        <div className="ui-table__pagination">
          <button type="button" className="ui-table__page-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Prev</button>
          <span className="ui-table__page-info">Page {table.getState().pagination.pageIndex + 1} / {Math.max(pageCount, 1)} · {table.getFilteredRowModel().rows.length} rows</span>
          <button type="button" className="ui-table__page-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
        </div>
      ) : null}
    </div>
  )
}

function SortableHeaderCell({
  id,
  disabled,
  className,
  style,
  children,
  ...props
}: {
  id: string
  disabled: boolean
  className: string
  style?: CSSProperties
  children: ReactNode
} & ThHTMLAttributes<HTMLTableCellElement>) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id, disabled })
  const childList = Children.toArray(children)

  return (
    <th
      ref={setNodeRef}
      className={className}
      style={{ ...style, transform: transform ? CSS.Translate.toString(transform) : undefined, transition }}
      {...props}
    >
      <span
        ref={setActivatorNodeRef}
        className="ui-table__drag-activator"
        {...attributes}
        {...(disabled ? {} : listeners)}
      >
        {childList[0]}
      </span>
      {childList.slice(1)}
    </th>
  )
}

function ReactRow({
  row,
  columns,
  colCount,
  renderExpanded,
  lazyMount,
  unmountOnExit,
  draggedColumnId,
}: {
  row: Row<TableRowData>
  columns: ColumnDef<TableRowData>[]
  colCount: number
  renderExpanded?: (row: Row<TableRowData>) => ReactNode
  lazyMount: boolean
  unmountOnExit: boolean
  draggedColumnId: string | null
}) {
  return (
    <>
      <tr className="ui-table__tr">
        {row.getVisibleCells().map(cell => {
          const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align ?? 'left'
          const pin = pinnedProps(cell.column)
          const isDragged = cell.column.id === draggedColumnId
          const moveStyle = isDragged
            ? {
                // The active body cell follows the pointer through a CSS
                // variable written by requestAnimationFrame, avoiding a
                // React render for every pointer-move event.
                transform: 'translate3d(var(--ui-table-drag-delta-x, 0px), 0, 0)',
                transition: 'none',
                position: 'relative' as const,
                zIndex: 2,
              }
            : undefined
          return <td key={cell.id} className={['ui-table__td', `ui-table__td--align-${align}`, pin.className].filter(Boolean).join(' ')} style={{ ...pin.style, ...pinnedBodyStyle(pin), ...moveStyle }} data-pinned={pin.dataPinned} data-pinned-edge={pin.dataPinnedEdge} data-column-id={cell.column.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
        })}
      </tr>
      {renderExpanded && row.getCanExpand() ? (
        <tr
          className="ui-table__tr ui-table__tr--expanded"
          data-expanded={row.getIsExpanded() ? 'true' : 'false'}
          aria-hidden={!row.getIsExpanded()}
        >
          <td className="ui-table__td ui-table__td--expanded" colSpan={colCount}>
            <AnimatedExpandedPresence present={row.getIsExpanded()} lazyMount={lazyMount} unmountOnExit={unmountOnExit}>
              {renderExpanded(row)}
            </AnimatedExpandedPresence>
          </td>
        </tr>
      ) : null}
    </>
  )
}

function AnimatedExpandedPresence({ present, lazyMount, unmountOnExit, children }: { present: boolean; lazyMount: boolean; unmountOnExit: boolean; children: ReactNode }) {
  const [panelElement, setPanelElement] = useState<HTMLDivElement | null>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const panelRef = useCallback((node: HTMLDivElement | null) => {
    setPanelElement(node)
  }, [])

  useLayoutEffect(() => {
    const inner = panelElement?.querySelector<HTMLElement>('.ui-table__expanded-presence-inner')
    if (!inner) return

    const updateHeight = () => {
      if (inner.scrollHeight > 0) setContentHeight(inner.scrollHeight)
    }

    updateHeight()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateHeight)
    observer?.observe(inner)
    return () => observer?.disconnect()
  }, [panelElement, children])

  return (
    <Presence
      asChild
      present={present}
      lazyMount={lazyMount}
      // The caller controls whether the animated node remains mounted after
      // exit; the default mode below still uses conditional rendering.
      unmountOnExit={unmountOnExit}
    >
      <div
        ref={panelRef}
        className="ui-table__expanded-presence"
        style={{ '--ui-table-expanded-height': `${contentHeight}px` } as CSSProperties}
      >
        <div className="ui-table__expanded-presence-inner">{children}</div>
      </div>
    </Presence>
  )
}
