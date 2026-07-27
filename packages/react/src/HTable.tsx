import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'
import type {
  TableContract,
  TablePaginationState,
  TableRowData,
  TableSortingState,
} from '@demo/ui-core'
import { renderTableCell } from './table-cells'

export interface HTableProps extends TableContract {
  /**
   * React escape hatch: fully custom TanStack column defs.
   * When set, replaces Core-mapped columns (advanced layouts / custom cells).
   */
  columnDefs?: ColumnDef<TableRowData, any>[]
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

/**
 * Shell over `@tanstack/react-table`.
 * Default: adapter owns sorting/pagination state (official pattern).
 */
export function HTable({
  columns: columnContracts,
  columnDefs,
  data,
  enableSorting = true,
  sorting: sortingProp,
  defaultSorting = [],
  onSortingChange,
  enablePagination = false,
  pageSize = 10,
  pagination: paginationProp,
  defaultPagination,
  onPaginationChange,
  padEmptyRows,
  density = 'comfortable',
  emptyText = 'No data',
  loading = false,
  caption,
}: HTableProps) {
  const shouldPad = padEmptyRows ?? enablePagination

  const [sorting, setSorting] = useState<SortingState>(() => toTanstackSorting(defaultSorting))
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: defaultPagination?.pageIndex ?? 0,
    pageSize: defaultPagination?.pageSize ?? pageSize,
  }))

  useEffect(() => {
    if (sortingProp !== undefined) setSorting(toTanstackSorting(sortingProp))
  }, [sortingProp])

  useEffect(() => {
    if (paginationProp !== undefined) {
      setPagination({
        pageIndex: paginationProp.pageIndex,
        pageSize: paginationProp.pageSize,
      })
    }
  }, [paginationProp])

  useEffect(() => {
    if (paginationProp === undefined) {
      setPagination(prev => (prev.pageSize === pageSize ? prev : { ...prev, pageSize }))
    }
  }, [pageSize, paginationProp])

  const columns = useMemo<ColumnDef<TableRowData>[]>(() => {
    if (columnDefs?.length) return columnDefs
    return columnContracts.map(column => ({
      id: column.id ?? column.accessorKey,
      accessorKey: column.accessorKey,
      header: column.header,
      ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
      size: column.size,
      minSize: column.minSize,
      meta: { align: column.align ?? 'left', cellType: column.cellType ?? 'text' },
      cell: info =>
        renderTableCell(info, column.cellType ?? 'text', column.align ?? (column.cellType === 'number' || column.cellType === 'progress' ? 'right' : 'left')),
    }))
  }, [columnContracts, columnDefs])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(enablePagination ? { pagination } : {}),
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
          onPaginationChange?.({
            pagination: {
              pageIndex: next.pageIndex,
              pageSize: next.pageSize,
            } satisfies TablePaginationState,
          })
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    enableSorting,
    autoResetPageIndex: false,
  })

  const rows = table.getRowModel().rows
  const pageCount = table.getPageCount()
  const colCount = Math.max(columns.length, 1)
  const currentPageSize = enablePagination ? table.getState().pagination.pageSize : rows.length
  const padCount = shouldPad && enablePagination && !loading ? Math.max(0, currentPageSize - rows.length) : 0

  return (
    <div className={['ui-table', `ui-table--${density}`].join(' ')}>
      {caption ? <div className="ui-table__caption">{caption}</div> : null}
      <div className="ui-table__scroll">
        <table className="ui-table__table">
          <thead className="ui-table__thead">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="ui-table__tr ui-table__tr--head">
                {headerGroup.headers.map(header => {
                  const canSort = enableSorting && header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const align =
                    (header.column.columnDef.meta as { align?: string } | undefined)?.align ?? 'left'
                  return (
                    <th
                      key={header.id}
                      className={[
                        'ui-table__th',
                        `ui-table__th--align-${align}`,
                        canSort ? 'ui-table__th--sortable' : '',
                        sorted === 'asc' ? 'ui-table__th--sorted-asc' : '',
                        sorted === 'desc' ? 'ui-table__th--sorted-desc' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        width: header.column.getSize() || undefined,
                        minWidth: header.column.columnDef.minSize || undefined,
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="ui-table__th-inner">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort ? (
                          <span className="ui-table__sort-indicator" aria-hidden>
                            {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}
                          </span>
                        ) : null}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="ui-table__tbody">
            {loading ? (
              <tr className="ui-table__tr">
                <td className="ui-table__td ui-table__td--empty" colSpan={colCount}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="ui-table__tr">
                <td className="ui-table__td ui-table__td--empty" colSpan={colCount}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              <>
                {rows.map(row => (
                  <tr key={row.id} className="ui-table__tr">
                    {row.getVisibleCells().map(cell => {
                      const align =
                        (cell.column.columnDef.meta as { align?: string } | undefined)?.align ?? 'left'
                      return (
                        <td
                          key={cell.id}
                          className={['ui-table__td', `ui-table__td--align-${align}`].join(' ')}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {Array.from({ length: padCount }).map((_, index) => (
                  <tr key={`pad-${index}`} className="ui-table__tr ui-table__tr--pad" aria-hidden>
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="ui-table__td ui-table__td--pad" />
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination ? (
        <div className="ui-table__pagination">
          <button
            type="button"
            className="ui-table__page-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <span className="ui-table__page-info">
            Page {table.getState().pagination.pageIndex + 1} / {Math.max(pageCount, 1)}
            {' · '}
            {table.getFilteredRowModel().rows.length} rows
          </span>
          <button
            type="button"
            className="ui-table__page-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}
