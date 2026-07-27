<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/vue-table'
import type {
  TableContract,
  TablePaginationChangeDetails,
  TablePaginationState,
  TableRowData,
  TableSortingChangeDetails,
  TableSortingState,
} from '@demo/ui-core'
import { renderTableCell } from './table-cells'

const props = withDefaults(defineProps<TableContract>(), {
  enableSorting: true,
  enablePagination: false,
  pageSize: 10,
  emptyText: 'No data',
  loading: false,
  density: 'comfortable',
})

const emit = defineEmits<{
  'sorting-change': [details: TableSortingChangeDetails]
  'pagination-change': [details: TablePaginationChangeDetails]
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

const sorting = ref<SortingState>(toTanstackSorting(props.defaultSorting))
const pagination = ref<PaginationState>({
  pageIndex: props.defaultPagination?.pageIndex ?? 0,
  pageSize: props.defaultPagination?.pageSize ?? props.pageSize,
})

watch(
  () => props.sorting,
  value => {
    if (value !== undefined) sorting.value = toTanstackSorting(value)
  },
)
watch(
  () => props.pagination,
  value => {
    if (value !== undefined) {
      pagination.value = { pageIndex: value.pageIndex, pageSize: value.pageSize }
    }
  },
)
watch(
  () => props.pageSize,
  value => {
    if (props.pagination === undefined) {
      pagination.value = { ...pagination.value, pageSize: value }
    }
  },
)

const dataRef = computed(() => props.data)

const columns = computed<ColumnDef<TableRowData>[]>(() =>
  props.columns.map(column => {
    const align =
      column.align ?? (column.cellType === 'number' || column.cellType === 'progress' ? 'right' : 'left')
    return {
      id: column.id ?? column.accessorKey,
      accessorKey: column.accessorKey,
      header: column.header,
      ...(column.enableSorting === undefined ? {} : { enableSorting: column.enableSorting }),
      size: column.size,
      minSize: column.minSize,
      meta: { align, cellType: column.cellType ?? 'text' },
      cell: info => renderTableCell(info, column.cellType ?? 'text', align),
    }
  }),
)

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
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  get enableSorting() {
    return props.enableSorting
  },
  autoResetPageIndex: false,
})

watch(
  () => [props.enableSorting, props.enablePagination] as const,
  ([enableSorting, enablePagination]) => {
    table.setOptions(prev => ({
      ...prev,
      enableSorting,
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    }))
  },
  { immediate: true },
)

const rows = computed(() => table.getRowModel().rows)
const headerGroups = computed(() => table.getHeaderGroups())
const pageCount = computed(() => table.getPageCount())
const colCount = computed(() => Math.max(props.columns.length, 1))
const shouldPad = computed(() => props.padEmptyRows ?? props.enablePagination)
const padCount = computed(() => {
  if (!shouldPad.value || !props.enablePagination || props.loading) return 0
  return Math.max(0, table.getState().pagination.pageSize - rows.value.length)
})
const densityClass = computed(() => `ui-table--${props.density}`)
</script>

<template>
  <div class="ui-table" :class="densityClass">
    <div v-if="caption" class="ui-table__caption">{{ caption }}</div>
    <div class="ui-table__scroll">
      <table class="ui-table__table">
        <thead class="ui-table__thead">
          <tr v-for="headerGroup in headerGroups" :key="headerGroup.id" class="ui-table__tr ui-table__tr--head">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="ui-table__th"
              :class="{
                'ui-table__th--sortable': enableSorting && header.column.getCanSort(),
                'ui-table__th--sorted-asc': header.column.getIsSorted() === 'asc',
                'ui-table__th--sorted-desc': header.column.getIsSorted() === 'desc',
                [`ui-table__th--align-${(header.column.columnDef.meta as any)?.align ?? 'left'}`]: true,
              }"
              :style="{
                width: header.column.getSize() ? `${header.column.getSize()}px` : undefined,
                minWidth: header.column.columnDef.minSize
                  ? `${header.column.columnDef.minSize}px`
                  : undefined,
              }"
              @click="
                enableSorting && header.column.getCanSort()
                  ? header.column.getToggleSortingHandler()?.($event)
                  : undefined
              "
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
            </th>
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
            <tr v-for="row in rows" :key="row.id" class="ui-table__tr">
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="ui-table__td"
                :class="`ui-table__td--align-${(cell.column.columnDef.meta as any)?.align ?? 'left'}`"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
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
</template>
