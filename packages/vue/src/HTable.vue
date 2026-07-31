<script setup lang="ts">
import { computed, ref, useSlots, watch, type CSSProperties, type PropType } from 'vue'
import { DragDropProvider, DragOverlay, KeyboardSensor, PointerSensor } from '@dnd-kit/vue'
import { PointerActivationConstraints } from '@dnd-kit/dom'
import { Modifier, type DragOperation } from '@dnd-kit/abstract'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type Row,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table'
import type {
  TableColumnOrderChangeDetails,
  TableColumnSizingChangeDetails,
  TableContract,
  PresenceContract,
  TableExpandedChangeDetails,
  TableExpandedState,
  TablePaginationChangeDetails,
  TablePaginationState,
  TableRowData,
  TableSortingChangeDetails,
  TableSortingState,
} from '@demo/ui-core'
import { renderTableCell } from './table-cells'
import HTableSortableHeader from './HTableSortableHeader.vue'
import HTableExpandedPresence from './HTableExpandedPresence.vue'

defineOptions({ inheritAttrs: false })

export type HTableVueProps = TableContract & Pick<PresenceContract, 'lazyMount' | 'unmountOnExit'> & {
  class?: string
  /** Predicate for expandable rows (Vue). Defaults true when expanding enabled. */
  getRowCanExpand?: (row: TableRowData) => boolean
}

const props = defineProps({
  columns: { type: Array as PropType<TableContract['columns']>, required: true },
  data: { type: Array as PropType<TableRowData[]>, required: true },
  class: String,
  fillHeight: { type: Boolean, default: false },
  enableSorting: { type: Boolean, default: true },
  sorting: Array as PropType<TableSortingState>,
  defaultSorting: Array as PropType<TableSortingState>,
  enablePagination: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  pagination: Object as PropType<TablePaginationState>,
  defaultPagination: Object as PropType<TablePaginationState>,
  padEmptyRows: { type: Boolean, default: undefined },
  density: { type: String as PropType<'compact' | 'comfortable'>, default: 'comfortable' },
  textAlign: { type: String as PropType<'left' | 'center' | 'right'>, default: 'left' },
  caption: String,
  emptyText: { type: String, default: 'No data' },
  loading: { type: Boolean, default: false },
  resizeable: { type: Boolean, default: false },
  enableColumnResizing: { type: Boolean, default: false },
  columnResizeMode: { type: String as PropType<'onChange' | 'onEnd'>, default: 'onChange' },
  columnSizing: Object as PropType<Record<string, number>>,
  defaultColumnSizing: Object as PropType<Record<string, number>>,
  draggable: { type: Boolean, default: false },
  enableColumnOrdering: { type: Boolean, default: false },
  columnOrder: Array as PropType<string[]>,
  defaultColumnOrder: Array as PropType<string[]>,
  enableExpanding: { type: Boolean, default: false },
  lazyMount: { type: Boolean, default: true },
  unmountOnExit: { type: Boolean, default: false },
  expanded: [Boolean, Object] as PropType<TableExpandedState>,
  defaultExpanded: [Boolean, Object] as PropType<TableExpandedState>,
  getRowCanExpand: Function as PropType<(row: TableRowData) => boolean>,
})

const emit = defineEmits<{
  'sorting-change': [details: TableSortingChangeDetails]
  'pagination-change': [details: TablePaginationChangeDetails]
  'column-sizing-change': [details: TableColumnSizingChangeDetails]
  'column-order-change': [details: TableColumnOrderChangeDetails]
  'expanded-change': [details: TableExpandedChangeDetails]
}>()

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
function toColumnPinning(columns: TableContract['columns'], includeExpander = false): ColumnPinningState {
  const left = [
    ...(includeExpander ? ['__expand'] : []),
    ...columns.filter(c => c.pinned === 'left').map(c => c.id ?? c.accessorKey),
  ]
  const right = columns.filter(c => c.pinned === 'right').map(c => c.id ?? c.accessorKey)
  return { left, right }
}

const shouldResize = computed(() => props.resizeable || props.enableColumnResizing)
const shouldDragColumns = computed(() => props.draggable || props.enableColumnOrdering)
const shouldPad = computed(() => props.padEmptyRows ?? props.enablePagination)
const slots = useSlots()
const shouldExpand = computed(() => props.enableExpanding || Boolean(slots.expanded))

const sorting = ref<SortingState>(toTanstackSorting(props.defaultSorting))
const pagination = ref<PaginationState>({
  pageIndex: props.defaultPagination?.pageIndex ?? 0,
  pageSize: props.defaultPagination?.pageSize ?? props.pageSize,
})
const columnSizing = ref<ColumnSizingState>({ ...(props.defaultColumnSizing ?? {}) })
const columnOrder = ref<ColumnOrderState>([...(props.defaultColumnOrder ?? [])])
const expanded = ref<ExpandedState>(props.defaultExpanded ?? {})
const columnPinning = ref<ColumnPinningState>(toColumnPinning(props.columns, shouldExpand.value))

const dragSourceId = ref<string | null>(null)
const dragOverColumnId = ref<string | null>(null)
const dragDeltaX = ref(0)
const tableRoot = ref<HTMLElement | null>(null)
let currentDragDeltaX = 0
let pendingDragDeltaX = 0
let dragFrame: number | null = null
let dragHeaderRect: DOMRect | null = null
const suppressSortClick = ref(false)

/** Keep the dragged header/overlay inside the table's horizontal viewport. */
class RestrictColumnDragToViewport extends Modifier {
  apply(operation: DragOperation) {
    const { transform } = operation
    const shape = operation.shape
    const tableEl = this.options?.tableRoot?.value
    if (!tableEl) return transform

    const scrollContainer: HTMLElement | null = tableEl.querySelector('.ui-table__scroll')
    const viewportRect = (scrollContainer || tableEl).getBoundingClientRect()
    const draggingRect = (shape as any)?.boundingRectangle as DOMRect | undefined

    if (!draggingRect || !viewportRect) return transform

    const minX = viewportRect.left - draggingRect.left
    const maxX = viewportRect.right - draggingRect.right

    return {
      ...transform,
      x: Math.min(maxX, Math.max(minX, transform.x)),
    }
  }
}

const dndModifiers = [
  { plugin: RestrictColumnDragToViewport, options: { tableRoot } },
]

const dndSensors = [
  PointerSensor.configure({
    activationConstraints: [new PointerActivationConstraints.Distance({ value: 6 })],
  }),
  KeyboardSensor,
]

watch(() => props.sorting, v => { if (v !== undefined) sorting.value = toTanstackSorting(v) })
watch(() => props.pagination, v => {
  if (v !== undefined) pagination.value = { pageIndex: v.pageIndex, pageSize: v.pageSize }
})
watch(() => props.pageSize, v => {
  if (props.pagination === undefined) pagination.value = { ...pagination.value, pageSize: v }
})
watch(() => props.columnSizing, v => { if (v !== undefined) columnSizing.value = { ...v } })
watch(() => props.columnOrder, v => { if (v !== undefined) columnOrder.value = [...v] })
watch(() => props.expanded, v => { if (v !== undefined) expanded.value = v })
watch(
  () => [props.columns, shouldExpand.value] as const,
  () => { columnPinning.value = toColumnPinning(props.columns, shouldExpand.value) },
  { deep: true },
)

const dataRef = computed(() => props.data)

const dataColumns = computed<ColumnDef<TableRowData>[]>(() =>
  props.columns.map(column => {
    const align = column.textAlign ?? column.align ?? props.textAlign
    return {
      id: column.id ?? column.accessorKey,
      accessorKey: column.accessorKey,
      header: column.header,
      ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
      size: column.size,
      minSize: column.minSize,
      maxSize: column.maxSize,
      ...(column.enableResizing === undefined ? {} : { enableResizing: column.enableResizing }),
      meta: {
        align,
        cellType: column.cellType ?? 'text',
        enableOrdering: column.enableOrdering,
      },
      cell: info => renderTableCell(info, column.cellType ?? 'text', align),
    }
  }),
)

const columns = computed<ColumnDef<TableRowData>[]>(() => {
  if (!shouldExpand.value) return dataColumns.value
  const expander: ColumnDef<TableRowData> = {
    id: '__expand',
    header: () => '',
    size: 48,
    minSize: 48,
    enableSorting: false,
    enableResizing: false,
    meta: { align: 'center', enableOrdering: false },
    cell: ({ row }) => row,
  }
  return [expander, ...dataColumns.value]
})

const table = useVueTable({
  data: dataRef,
  get columns() {
    return columns.value
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get pagination() {
      return pagination.value
    },
    get columnSizing() {
      return columnSizing.value
    },
    get columnOrder() {
      return columnOrder.value
    },
    get columnPinning() {
      return columnPinning.value
    },
    get expanded() {
      return expanded.value
    },
  },
  onSortingChange: updater => {
    sorting.value = applyUpdater(updater, sorting.value)
    emit('sorting-change', { sorting: fromTanstackSorting(sorting.value) })
  },
  onPaginationChange: updater => {
    pagination.value = applyUpdater(updater, pagination.value)
    emit('pagination-change', {
      pagination: {
        pageIndex: pagination.value.pageIndex,
        pageSize: pagination.value.pageSize,
      } satisfies TablePaginationState,
    })
  },
  onColumnSizingChange: updater => {
    columnSizing.value = applyUpdater(updater, columnSizing.value)
    emit('column-sizing-change', { sizing: { ...columnSizing.value } })
  },
  onColumnOrderChange: updater => {
    columnOrder.value = applyUpdater(updater, columnOrder.value)
    emit('column-order-change', { order: [...columnOrder.value] })
  },
  onExpandedChange: updater => {
    expanded.value = applyUpdater(updater, expanded.value)
    emit('expanded-change', { expanded: toCoreExpanded(expanded.value) })
  },
  onColumnPinningChange: updater => {
    columnPinning.value = applyUpdater(updater, columnPinning.value)
  },
  getSubRows: row => (Array.isArray(row.subRows) ? (row.subRows as TableRowData[]) : undefined),
  getRowCanExpand: row => {
    if (props.getRowCanExpand) return props.getRowCanExpand(row.original)
    return shouldExpand.value || Boolean(row.subRows?.length)
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  get enableSorting() {
    return props.enableSorting
  },
  get enableColumnResizing() {
    return shouldResize.value
  },
  get columnResizeMode() {
    return props.columnResizeMode
  },
  get enableExpanding() {
    return shouldExpand.value
  },
  defaultColumn: { size: 150, minSize: 40, maxSize: 1200 },
  autoResetPageIndex: false,
})

watch(
  () =>
    [
      props.enableSorting,
      props.enablePagination,
      shouldResize.value,
      shouldExpand.value,
      props.columnResizeMode,
    ] as const,
  ([enableSorting, enablePagination, resize, expand, resizeMode]) => {
    table.setOptions(prev => ({
      ...prev,
      enableSorting,
      enableColumnResizing: resize,
      columnResizeMode: resizeMode,
      enableExpanding: expand,
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
      getExpandedRowModel: expand ? getExpandedRowModel() : undefined,
    }))
  },
  { immediate: true },
)

const rows = computed(() => table.getRowModel().rows)
const headerGroups = computed(() => table.getHeaderGroups())
const pageCount = computed(() => table.getPageCount())
const colCount = computed(() => Math.max(columns.value.length, 1))
const draggedHeader = computed(() =>
  headerGroups.value[headerGroups.value.length - 1]?.headers.find(header => header.column.id === dragSourceId.value),
)
const padCount = computed(() => {
  if (!shouldPad.value || !props.enablePagination || props.loading) return 0
  return Math.max(0, table.getState().pagination.pageSize - rows.value.length)
})

function arrayMove<T>(items: T[], from: number, to: number) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

const columnMoveOffsets = computed<Record<string, number>>(() => {
  if (!dragSourceId.value) return {}
  // Read the reactive sizing/order state so a live resize stays reflected while dragging.
  void columnSizing.value
  void columnOrder.value
  const centerColumns = table.getCenterLeafColumns()
  const centerIds = centerColumns.map(column => column.id)
  const sourceIndex = centerIds.indexOf(dragSourceId.value)
  const targetIndex = dragOverColumnId.value ? centerIds.indexOf(dragOverColumnId.value) : -1
  if (sourceIndex < 0) return {}

  const previewIds = targetIndex >= 0 && targetIndex !== sourceIndex
    ? arrayMove(centerIds, sourceIndex, targetIndex)
    : centerIds
  const originalStarts = new Map<string, number>()
  const previewStarts = new Map<string, number>()
  let originalStart = 0
  for (const column of centerColumns) {
    originalStarts.set(column.id, originalStart)
    originalStart += column.getSize()
  }
  let previewStart = 0
  for (const id of previewIds) {
    previewStarts.set(id, previewStart)
    previewStart += centerColumns.find(column => column.id === id)?.getSize() ?? 0
  }

    return Object.fromEntries(centerIds.map(id => [
      id,
      id === dragSourceId.value
        ? currentDragDeltaX
        : (previewStarts.get(id) ?? 0) - (originalStarts.get(id) ?? 0),
    ]))
})
const tableClasses = computed(() =>
  [
    'ui-table',
    `ui-table--${props.density}`,
    props.fillHeight ? 'ui-table--fill-height' : '',
    shouldExpand.value ? 'ui-table--animated-expansion' : '',
    props.class,
  ].filter(Boolean),
)

function pinnedStyle(column: {
  getIsPinned: () => false | 'left' | 'right'
  getStart: (p: 'left' | 'right') => number
  getAfter: (p: 'left' | 'right') => number
  getIsFirstColumn: (p?: 'left' | 'right' | 'center') => boolean
  getIsLastColumn: (p?: 'left' | 'right' | 'center') => boolean
}): { className: string; style: CSSProperties; dataPinned?: string; dataPinnedEdge?: string } {
  const pinned = column.getIsPinned()
  if (!pinned) return { className: '', style: {} }
  const offset = pinned === 'left' ? column.getStart('left') : column.getAfter('right')
  return {
    className: `ui-table__cell--pinned-${pinned}`,
    style: {
      position: 'sticky',
      zIndex: 2,
      ...(pinned === 'left' ? { left: `${offset}px` } : { right: `${offset}px` }),
    },
    dataPinned: pinned,
    dataPinnedEdge: column.getIsFirstColumn(pinned)
      ? 'start'
      : column.getIsLastColumn(pinned)
        ? 'end'
        : undefined,
  }
}

function isOrderable(header: { column: { id: string; getIsPinned: () => false | 'left' | 'right'; columnDef: { meta?: { enableOrdering?: boolean } } } }) {
  const meta = header.column.columnDef.meta
  return (
    shouldDragColumns.value &&
    header.column.id !== '__expand' &&
    !header.column.getIsPinned() &&
    meta?.enableOrdering !== false
  )
}

function onHeaderClick(header: any, event: MouseEvent) {
  if (suppressSortClick.value) {
    suppressSortClick.value = false
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (props.enableSorting && header.column.getCanSort()) {
    header.column.getToggleSortingHandler()?.(event)
  }
}

function onDndDragStart(event: any) {
  suppressSortClick.value = true
  dragSourceId.value = event.operation?.source?.id == null ? null : String(event.operation.source.id)
  dragOverColumnId.value = null
  dragDeltaX.value = 0
  currentDragDeltaX = 0
  dragHeaderRect = null
  tableRoot.value?.style.setProperty('--ui-table-drag-delta-x', '0px')

  // Capture the dragged header's initial bounding rect for viewport clamping
  const sourceEl = event.operation?.source?.element
  if (sourceEl) {
    dragHeaderRect = (sourceEl as HTMLElement).getBoundingClientRect()
  }
}

function clampDragDeltaX(delta: number): number {
  if (!dragHeaderRect || !tableRoot.value) return delta

  const scrollContainer = tableRoot.value.querySelector<HTMLElement>('.ui-table__scroll')
  const viewportRect = (scrollContainer || tableRoot.value).getBoundingClientRect()

  const minX = viewportRect.left - dragHeaderRect.left
  const maxX = viewportRect.right - dragHeaderRect.right

  return Math.min(maxX, Math.max(minX, delta))
}

function onDndDragMove(event: any) {
  // PointerSensor / TouchSensor pass absolute coords (`to`) rather than
  // relative deltas (`by`). `delta` on the Position object is a non-enumerable
  // derived getter — it won't survive the snapshot copied into the event.
  // Compute the horizontal displacement from the drag origin instead so the
  // CSS variable always reflects the full offset from rAF (no re-render).
  const toX = event.to?.x
  const initialX = event.operation?.position?.initial?.x
  if (toX != null && initialX != null) {
    pendingDragDeltaX = clampDragDeltaX(toX - initialX)
  } else {
    // KeyboardSensor and other non-pointer sensors pass a relative delta.
    pendingDragDeltaX = event.by?.x ?? 0
  }
  if (dragFrame !== null) return
  dragFrame = window.requestAnimationFrame(() => {
    dragFrame = null
    currentDragDeltaX = pendingDragDeltaX
    tableRoot.value?.style.setProperty('--ui-table-drag-delta-x', `${currentDragDeltaX}px`)
  })
}

function onDndDragOver(event: any) {
  const targetId = event.operation?.target?.id
  const sourceId = event.operation?.source?.id
  // OptimisticSortingPlugin resets operation.target → source.id inside a
  // microtask after reordering; that would overwrite the real target here.
  // Only commit a target that differs from the source so the last meaningful
  // drop target stays reachable for onDndDragEnd.
  if (targetId != null && targetId !== sourceId) {
    dragOverColumnId.value = String(targetId)
  } else if (targetId == null) {
    dragOverColumnId.value = null
  }
}

function onDndDragEnd(event: any) {
  const sourceId = event.operation?.source?.id
  if (event.canceled) {
    dragSourceId.value = null
    dragOverColumnId.value = null
    dragDeltaX.value = 0
    clearDragDelta()
    return
  }

  // The OptimisticSortingPlugin physically reorders the header DOM elements
  // inside a queueMicrotask → nextTick chain.  If we commit here synchronously
  // the committed order may diverge from what the plugin's visual reorder
  // showed.  Wait for the plugin to finish (rAF fires after all microtasks
  // drain), then read the actual DOM header order and commit that.
  // Keeps dragSourceId / CSS variable alive until the rAF so body cells stay
  // at their dragged positions — no snap-back.
  const targetId = dragOverColumnId.value
  window.requestAnimationFrame(() => {
    const visualOrder = readVisualCenterColumnOrder()
    dragSourceId.value = null
    dragOverColumnId.value = null
    dragDeltaX.value = 0
    clearDragDelta()

    if (visualOrder.length > 0) {
      setColumnOrder(visualOrder)
    } else if (sourceId != null && targetId != null && sourceId !== targetId) {
      moveColumn(String(sourceId), String(targetId))
    }
  })
}

function clearDragDelta() {
  if (dragFrame !== null) {
    window.cancelAnimationFrame(dragFrame)
    dragFrame = null
  }
  currentDragDeltaX = 0
  pendingDragDeltaX = 0
  tableRoot.value?.style.setProperty('--ui-table-drag-delta-x', '0px')
}

function moveColumn(sourceId: string, targetId: string) {
  const centerIds = table.getCenterLeafColumns().map(column => column.id)
  const from = centerIds.indexOf(sourceId)
  const to = centerIds.indexOf(targetId)
  if (from < 0 || to < 0 || from === to) return
  const next = [...centerIds]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  setColumnOrder(next)
}

function setColumnOrder(next: string[]) {
  // Update both Vue state and TanStack's column-order feature so header and
  // row cells use the same visible-column order.
  columnOrder.value = next
  table.setColumnOrder(next)
}

/**
 * Read column order from the actual DOM (kept consistent by the
 * OptimisticSortingPlugin's reorder calls).  Falls back to empty array when
 * the DOM does not contain every expected column id.
 */
function readVisualCenterColumnOrder(): string[] {
  const expected = table.getCenterLeafColumns().map(column => column.id)
  const expectedIds = new Set(expected)
  const headers = tableRoot.value?.querySelectorAll<HTMLElement>(
    'thead tr:last-child [data-column-id]',
  )
  if (!headers) return []

  const visualOrder = Array.from(headers)
    .map(header => header.dataset.columnId)
    .filter((id): id is string => id !== undefined && expectedIds.has(id))

  return visualOrder.length === expected.length ? visualOrder : []
}

function headerCellStyle(header: any): CSSProperties {
  const pin = pinnedStyle(header.column)
  return {
    ...pin.style,
    width: header.column.getSize() ? `${header.column.getSize()}px` : undefined,
    minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
    maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
  }
}

function pinnedBodyStyle(pin: ReturnType<typeof pinnedStyle>): CSSProperties {
  if (!pin.dataPinned) return {}

  const sideShadow = pin.dataPinned === 'left'
    ? '1px 0 0 var(--ui-color-hairline)'
    : '-1px 0 0 var(--ui-color-hairline)'

  return {
    // Keep Vue body cells aligned with React and preserve the row rule when
    // the table uses separate borders for sticky-column compositing.
    boxShadow: `inset 0 -1px 0 var(--ui-color-hairline), ${sideShadow}`,
  }
}

function bodyCellStyle(cell: any): CSSProperties {
  const pin = pinnedStyle(cell.column)
  const pinnedBody = pinnedBodyStyle(pin)
  const baseStyle = { ...pin.style, ...pinnedBody }
  const moveOffset = columnMoveOffsets.value[cell.column.id]
  if (cell.column.id === dragSourceId.value) {
    return {
      ...baseStyle,
      transform: 'translate3d(var(--ui-table-drag-delta-x, 0px), 0, 0)',
      transition: 'none',
      position: 'relative',
      zIndex: 2,
    }
  }
  if (moveOffset === undefined || moveOffset === 0) return baseStyle
  return {
    ...baseStyle,
    transform: `translate3d(${moveOffset}px, 0, 0)`,
    transition: 'transform var(--ui-table-column-move-duration, 180ms) var(--ui-table-column-move-easing, ease)',
    ...(cell.column.id === dragSourceId.value ? { position: 'relative', zIndex: 2 } : {}),
  }
}

/**
 * TanStack's row cell model keeps the center cells in their creation order.
 * Column ordering is applied to the column/header model, so render the body
 * from the same ordered leaf-column list to keep headers and cells aligned.
 */
function orderedCells(row: Row<TableRowData>) {
  const cellsByColumnId = new Map(row.getVisibleCells().map(cell => [cell.column.id, cell]))
  const orderedColumns = [
    ...table.getLeftLeafColumns(),
    ...table.getCenterLeafColumns(),
    ...table.getRightLeafColumns(),
  ]

  return orderedColumns
    .map(column => cellsByColumnId.get(column.id))
    .filter((cell): cell is ReturnType<Row<TableRowData>['getVisibleCells']>[number] => Boolean(cell))
}

function isExpanderCell(cell: any) {
  return cell.column.id === '__expand'
}
</script>

<template>
  <DragDropProvider
    :sensors="dndSensors"
    :modifiers="dndModifiers"
    @dragStart="onDndDragStart"
    @dragMove="onDndDragMove"
    @dragOver="onDndDragOver"
    @dragEnd="onDndDragEnd"
  >
   <div ref="tableRoot" :class="tableClasses">
    <div v-if="caption" class="ui-table__caption">{{ caption }}</div>
    <div class="ui-table__scroll">
      <table class="ui-table__table">
        <colgroup>
          <col
            v-for="header in headerGroups[headerGroups.length - 1]?.headers ?? []"
            :key="header.id"
            :style="{ width: `${header.column.getSize()}px` }"
          >
        </colgroup>
        <thead class="ui-table__thead">
          <tr
            v-for="headerGroup in headerGroups"
            :key="headerGroup.id"
            class="ui-table__tr ui-table__tr--head"
          >
            <HTableSortableHeader
              v-for="header in headerGroup.headers"
              :key="header.id"
              :id="header.column.id!"
              :index="Math.max(0, header.column.getIndex('center'))"
              :disabled="!isOrderable(header)"
              class="ui-table__th"
              :class="{
                'ui-table__th--sortable': enableSorting && header.column.getCanSort(),
                'ui-table__th--sorted-asc': header.column.getIsSorted() === 'asc',
                'ui-table__th--sorted-desc': header.column.getIsSorted() === 'desc',
                'ui-table__th--draggable': isOrderable(header),
                'ui-table__th--dragging': dragSourceId === header.column.id,
                'ui-table__th--drag-over': dragOverColumnId === header.column.id,
                [`ui-table__th--align-${(header.column.columnDef.meta as any)?.align ?? 'left'}`]: true,
                [pinnedStyle(header.column).className]: !!pinnedStyle(header.column).className,
              }"
              :style="headerCellStyle(header)"
              :data-pinned="pinnedStyle(header.column).dataPinned"
              :data-pinned-edge="pinnedStyle(header.column).dataPinnedEdge"
              :data-column-id="header.column.id"
              :data-column-orderable="isOrderable(header) ? 'true' : undefined"
              @click="onHeaderClick(header, $event)"
            >
              <span class="ui-table__th-inner">
                <template v-if="!header.isPlaceholder">
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                  <span
                    v-if="enableSorting && header.column.getCanSort()"
                    class="ui-table__sort-indicator"
                    aria-hidden="true"
                  >
                    {{
                      header.column.getIsSorted() === 'asc'
                        ? '▲'
                        : header.column.getIsSorted() === 'desc'
                          ? '▼'
                          : '↕'
                    }}
                  </span>
                </template>
              </span>
              <template #resize>
                <span
                  v-if="shouldResize && header.column.getCanResize()"
                  class="ui-table__resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize column"
                  @mousedown="header.getResizeHandler()?.($event)"
                  @touchstart="header.getResizeHandler()?.($event)"
                  @pointerdown.stop
                  @click.stop
                />
              </template>
            </HTableSortableHeader>
          </tr>
        </thead>
        <tbody class="ui-table__tbody">
          <tr v-if="loading" class="ui-table__tr">
            <td class="ui-table__td ui-table__td--empty" :colspan="colCount">Loading…</td>
          </tr>
          <tr v-else-if="rows.length === 0" class="ui-table__tr">
            <td class="ui-table__td ui-table__td--empty" :colspan="colCount">{{ emptyText }}</td>
          </tr>
          <template v-else>
            <template v-for="row in rows" :key="row.id">
              <tr class="ui-table__tr">
                <td
                  v-for="cell in orderedCells(row)"
                  :key="cell.id"
                  class="ui-table__td"
                  :class="[
                    `ui-table__td--align-${(cell.column.columnDef.meta as any)?.align ?? 'left'}`,
                    pinnedStyle(cell.column).className,
                  ]"
                  :style="bodyCellStyle(cell)"
                  :data-pinned="pinnedStyle(cell.column).dataPinned"
                  :data-pinned-edge="pinnedStyle(cell.column).dataPinnedEdge"
                  :data-column-id="cell.column.id"
                >
                  <template v-if="isExpanderCell(cell)">
                    <button
                      v-if="row.getCanExpand()"
                      type="button"
                      class="ui-table__expand-trigger"
                      :aria-label="row.getIsExpanded() ? 'Collapse row' : 'Expand row'"
                      :aria-expanded="row.getIsExpanded()"
                      @click="row.toggleExpanded()"
                    >
                      {{ row.getIsExpanded() ? '▾' : '▸' }}
                    </button>
                  </template>
                  <FlexRender v-else :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                </td>
              </tr>
              <tr
                v-if="shouldExpand && row.getCanExpand()"
                class="ui-table__tr ui-table__tr--expanded"
                :data-expanded="row.getIsExpanded() ? 'true' : 'false'"
                :aria-hidden="!row.getIsExpanded()"
              >
                <td class="ui-table__td ui-table__td--expanded" :colspan="colCount">
                  <HTableExpandedPresence
                    :present="row.getIsExpanded()"
                    :lazy-mount="lazyMount"
                    :unmount-on-exit="unmountOnExit"
                  >
                    <slot name="expanded" :row="row">
                      <pre class="ui-table__expanded-fallback">{{ row.original }}</pre>
                    </slot>
                  </HTableExpandedPresence>
                </td>
              </tr>
            </template>
            <tr
              v-for="index in padCount"
              :key="`pad-${index}`"
              class="ui-table__tr ui-table__tr--pad"
              aria-hidden="true"
            >
              <td v-for="colIndex in colCount" :key="colIndex" class="ui-table__td ui-table__td--pad" />
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <DragOverlay :drop-animation="null">
      <div
        v-if="draggedHeader"
        class="ui-table__drag-overlay"
        :style="{ width: `${draggedHeader.column.getSize()}px` }"
      >
        <span class="ui-table__th-inner">
          <FlexRender
            v-if="!draggedHeader.isPlaceholder"
            :render="draggedHeader.column.columnDef.header"
            :props="draggedHeader.getContext()"
          />
        </span>
      </div>
    </DragOverlay>

    <div v-if="enablePagination" class="ui-table__pagination">
      <button
        type="button"
        class="ui-table__page-btn"
        :disabled="!table.getCanPreviousPage()"
        @click="table.previousPage()"
      >
        Prev
      </button>
      <span class="ui-table__page-info">
        Page {{ table.getState().pagination.pageIndex + 1 }} / {{ Math.max(pageCount, 1) }}
        · {{ table.getFilteredRowModel().rows.length }} rows
      </span>
      <button
        type="button"
        class="ui-table__page-btn"
        :disabled="!table.getCanNextPage()"
        @click="table.nextPage()"
      >
        Next
      </button>
    </div>
  </div>
  </DragDropProvider>
</template>
