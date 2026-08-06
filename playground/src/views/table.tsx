import { useMemo, useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HButton, HTable, HTag, HVStack, HStack, HSpacer } from '@demo/ui-react'
import { HButton as VueHButton, HTable as VueHTable } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import type {
  TableColumnContract,
  TableColumnOrderState,
  TableColumnSizingState,
  TableExpandedState,
  TableRowData,
  TableRowOrderState,
  TableSortingState,
} from '@demo/ui-core'

/**
 * Full Core TableContract surface for demos.
 * React, Vue and WC demos expose the shared TableContract controls. The render
 * escape hatch differs by adapter: React callback, Vue slot, WC template.
 */

const columns: TableColumnContract[] = [
  {
    accessorKey: 'project',
    header: 'Project',
    minSize: 140,
    maxSize: 320,
    pinned: 'left',
    enableOrdering: false,
  },
  { accessorKey: 'owner', header: 'Owner', size: 120, minSize: 80 },
  { accessorKey: 'status', header: 'Status', cellType: 'tag', size: 110, textAlign: 'center' },
  { accessorKey: 'priority', header: 'Priority', cellType: 'badge', size: 100 },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cellType: 'progress',
    size: 150,
    minSize: 120,
    maxSize: 240,
  },
  { accessorKey: 'budget', header: 'Budget', cellType: 'number', size: 110, textAlign: 'right' },
  { accessorKey: 'updatedAt', header: 'Updated', cellType: 'datetime', size: 150 },
  {
    accessorKey: 'active',
    header: 'Live',
    cellType: 'boolean',
    size: 72,
    enableSorting: false,
    enableResizing: false,
    pinned: 'right',
    enableOrdering: false,
  },
]

const data: TableRowData[] = [
  {
    project: 'MeshFlow Console',
    owner: 'Ada Lovelace',
    status: 'Active',
    priority: 'High',
    progress: 82,
    budget: 128000,
    updatedAt: '2026-07-20T09:15:00Z',
    active: true,
    notes: 'Primary ops shell for MeshFlow forms + tables.',
  },
  {
    project: 'Telemetry Pipeline',
    owner: 'Grace Hopper',
    status: 'Active',
    priority: 'Critical',
    progress: 64,
    budget: 256000,
    updatedAt: '2026-07-21T14:02:00Z',
    active: true,
    notes: 'Ingest lag under SLO; watch night-shift batch.',
  },
  {
    project: 'Auth Gateway',
    owner: 'Alan Turing',
    status: 'Pending',
    priority: 'Medium',
    progress: 35,
    budget: 89000,
    updatedAt: '2026-07-18T11:40:00Z',
    active: false,
    notes: 'Waiting on cert rotation window.',
  },
  {
    project: 'Design Tokens',
    owner: 'Katherine Johnson',
    status: 'Done',
    priority: 'Low',
    progress: 100,
    budget: 42000,
    updatedAt: '2026-07-12T08:00:00Z',
    active: true,
    notes: 'industry / industry-dark tokens shipped.',
  },
  {
    project: 'Edge Cache',
    owner: 'Claude Shannon',
    status: 'Away',
    priority: 'High',
    progress: 48,
    budget: 175000,
    updatedAt: '2026-07-19T16:22:00Z',
    active: false,
    notes: 'Region failover drill scheduled.',
  },
  {
    project: 'Form Runtime',
    owner: 'Margaret Hamilton',
    status: 'Active',
    priority: 'High',
    progress: 91,
    budget: 98000,
    updatedAt: '2026-07-22T07:55:00Z',
    active: true,
    notes: 'MeshFlow field pack almost complete.',
  },
  {
    project: 'WC Adapter Kit',
    owner: 'Barbara Liskov',
    status: 'Review',
    priority: 'Medium',
    progress: 57,
    budget: 61000,
    updatedAt: '2026-07-17T13:10:00Z',
    active: true,
    notes: 'Lit TableController parity review.',
  },
  {
    project: 'Billing Export',
    owner: 'Donald Knuth',
    status: 'Blocked',
    priority: 'Critical',
    progress: 12,
    budget: 140000,
    updatedAt: '2026-07-15T19:30:00Z',
    active: false,
    notes: 'Blocked on ledger API schema freeze.',
  },
  {
    project: 'Search Index',
    owner: 'Radia Perlman',
    status: 'Active',
    priority: 'Medium',
    progress: 73,
    budget: 112000,
    updatedAt: '2026-07-23T10:05:00Z',
    active: true,
    notes: 'Reindex nightly on compact density cluster.',
  },
  {
    project: 'Audit Trail',
    owner: 'Tim Berners-Lee',
    status: 'Idle',
    priority: 'Low',
    progress: 20,
    budget: 33000,
    updatedAt: '2026-07-10T06:18:00Z',
    active: false,
    notes: 'Retention policy TBD.',
  },
  {
    project: 'Notification Hub',
    owner: 'Vint Cerf',
    status: 'Active',
    priority: 'High',
    progress: 66,
    budget: 87000,
    updatedAt: '2026-07-24T12:44:00Z',
    active: true,
    notes: 'Toast + drawer fan-out.',
  },
  {
    project: 'Schema Registry',
    owner: 'Frances Allen',
    status: 'Pending',
    priority: 'Medium',
    progress: 41,
    budget: 54000,
    updatedAt: '2026-07-16T15:27:00Z',
    active: true,
    notes: 'Compatibility mode for WC JSON attrs.',
  },
]

const PAGE_SIZE = 5

const defaultOrder: TableColumnOrderState = columns.map(c => c.id ?? c.accessorKey)

function formatSorting(sorting: TableSortingState) {
  return sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(', ') || '(none)'
}

function formatExpanded(expanded: TableExpandedState) {
  if (expanded === true) return 'all'
  const keys = Object.keys(expanded).filter(k => (expanded as Record<string, boolean>)[k])
  return keys.length ? keys.join(',') : '(none)'
}

const VueTableDemo = defineComponent({
  name: 'VueTableDemo',
  setup() {
    const sorting = ref<TableSortingState>([{ id: 'progress', desc: true }])
    const pageIndex = ref(0)
    const pageSize = ref(PAGE_SIZE)
    const pageLabel = ref('1')
    const orderLabel = ref('(default)')
    const sizingLabel = ref('{}')
    const expandedLabel = ref('(none)')
    const density = ref<'comfortable' | 'compact'>('comfortable')
    const loading = ref(false)
    const emptyMode = ref(false)
    const fillHeight = ref(false)
    const padEmptyRows = ref(true)
    const resizeable = ref(true)
    const draggable = ref(true)
    const columnOrder = ref<TableColumnOrderState>(defaultOrder)
    const columnSizing = ref<TableColumnSizingState>({})
    const expanded = ref<TableExpandedState>({ '0': true })

    return () =>
      h('div', { class: 'demo-stack table-demo', style: 'width:100%' }, [
        h(
          'p',
          { class: 'table-demo-note' },
          'Vue aligned with React: pin, resize, dnd-kit column drag, expand (#expanded slot), density, padEmptyRows.',
        ),
        h('div', { class: 'table-demo-toolbar' }, [
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { density.value = density.value === 'compact' ? 'comfortable' : 'compact' } }, { default: () => `density: ${density.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { resizeable.value = !resizeable.value } }, { default: () => `resizeable: ${resizeable.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { draggable.value = !draggable.value } }, { default: () => `draggable: ${draggable.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { loading.value = true; window.setTimeout(() => { loading.value = false }, 900) } }, { default: () => 'flash loading' }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { padEmptyRows.value = !padEmptyRows.value } }, { default: () => `padEmptyRows: ${padEmptyRows.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { pageIndex.value = 2 } }, { default: () => 'go last page' }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { pageSize.value = pageSize.value === 5 ? 8 : 5; pageIndex.value = 0 } }, { default: () => `pageSize: ${pageSize.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { fillHeight.value = !fillHeight.value } }, { default: () => `fillHeight: ${fillHeight.value}` }),
          h(VueHButton, { size: 'sm', variant: 'secondary', onClick: () => { emptyMode.value = !emptyMode.value } }, { default: () => `empty: ${emptyMode.value}` }),
        ]),
        h(
          VueHTable,
          {
            caption: 'Projects (Vue · full table features)',
            columns,
            data: emptyMode.value ? [] : data,
            enableSorting: true,
            enablePagination: true,
            sorting: sorting.value,
            pageSize: pageSize.value,
            pagination: { pageIndex: pageIndex.value, pageSize: pageSize.value },
            padEmptyRows: padEmptyRows.value,
            fillHeight: fillHeight.value,
            density: density.value,
            loading: loading.value,
            emptyText: 'No rows',
            resizeable: resizeable.value,
            draggable: draggable.value,
            columnOrder: columnOrder.value,
            columnSizing: columnSizing.value,
            enableExpanding: true,
            lazyMount: true,
            unmountOnExit: false,
            expanded: expanded.value,
            'onSorting-change': (d: { sorting: TableSortingState }) => {
              sorting.value = d.sorting
            },
            'onPagination-change': (d: { pagination: { pageIndex: number; pageSize: number } }) => {
              pageIndex.value = d.pagination.pageIndex
              pageSize.value = d.pagination.pageSize
              pageLabel.value = `${d.pagination.pageIndex + 1} (size ${d.pagination.pageSize})`
            },
            'onColumn-order-change': (d: { order: string[] }) => {
              columnOrder.value = d.order
              orderLabel.value = d.order.join('›')
            },
            'onColumn-sizing-change': (d: { sizing: Record<string, number> }) => {
              columnSizing.value = d.sizing
              sizingLabel.value = JSON.stringify(d.sizing)
            },
            'onExpanded-change': (d: { expanded: TableExpandedState }) => {
              expanded.value = d.expanded
              expandedLabel.value = formatExpanded(d.expanded)
            },
          },
          {
            expanded: ({ row }: { row: { original: TableRowData } }) =>
              h('div', { class: 'table-demo-expanded' }, [
                h('span', [
                  h('strong', String(row.original.project ?? '')),
                  h('small', 'Project'),
                ]),
                h('span', [h('strong', String(row.original.owner ?? '')), h('small', 'Owner')]),
                h('span', [
                  h('strong', String(row.original.notes ?? '—')),
                  h('small', '#expanded slot'),
                ]),
              ]),
          },
        ),
        h(
          'span',
          { class: 'demo-result' },
          `sort=${formatSorting(sorting.value)} · page=${pageLabel.value} · expanded=${expandedLabel.value} · order=${orderLabel.value} · sizing=${sizingLabel.value}`,
        ),
      ])
  },
})

function TableWebDemo() {
  return (
    <div
      className="demo-stack table-demo"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<p class="table-demo-note">
             WC aligned: pin, resize handles, dnd-kit column drag, expand + template data-slot="expanded", density, padEmptyRows.
           </p>
           <div class="table-demo-toolbar">
             <h-button id="wc-density" size="sm" variant="secondary">density: comfortable</h-button>
             <h-button id="wc-resizeable" size="sm" variant="secondary">resizeable: true</h-button>
             <h-button id="wc-draggable" size="sm" variant="secondary">draggable: true</h-button>
             <h-button id="wc-pad" size="sm" variant="secondary">padEmptyRows: true</h-button>
             <h-button id="wc-fill" size="sm" variant="secondary">fillHeight: false</h-button>
             <h-button id="wc-empty" size="sm" variant="secondary">empty: false</h-button>
             <h-button id="wc-page-size" size="sm" variant="secondary">pageSize: ${PAGE_SIZE}</h-button>
             <h-button id="wc-loading" size="sm" variant="secondary">flash loading</h-button>
           </div>
           <h-table
             caption="Projects (WC · full table features)"
             enable-sorting
             enable-pagination
             enable-expanding
             resizeable
             draggable
             lazy-mount
             page-size="${PAGE_SIZE}"
             density="comfortable"
             empty-text="No rows"
             default-sorting='${JSON.stringify([{ id: 'budget', desc: true }])}'
             default-expanded='${JSON.stringify({ '0': true })}'
             columns='${JSON.stringify(columns)}'
             data='${JSON.stringify(data)}'
             style="width:100%"
           >
             <template data-slot="expanded">
               <div class="table-demo-expanded">
                 <span><strong data-bind="project"></strong><small>Project</small></span>
                 <span><strong data-bind="owner"></strong><small>Owner</small></span>
                 <span><strong data-bind="notes"></strong><small>template expanded</small></span>
               </div>
             </template>
           </h-table>
           <span class="demo-result">Sorting: budget:desc · Page: 1 · order/sizing/expanded via events</span>`,
          host => {
            const el = host.querySelector('h-table') as HTMLElement | null
            const out = host.querySelector('.demo-result')
            if (!el || !out) return

            const table = el as HTMLElement & {
              columns: TableColumnContract[]
              data: TableRowData[]
              density: 'comfortable' | 'compact'
              resizeable: boolean
              draggable: boolean
              lazyMount: boolean
              unmountOnExit: boolean
              padEmptyRows: boolean
              fillHeight: boolean
              loading: boolean
              pageSize: number
            }
            table.lazyMount = true
            table.unmountOnExit = false
            table.padEmptyRows = true
            let emptyMode = false
            const button = (id: string) => host.querySelector(`#${id}`)
            const paintControls = () => {
              button('wc-density')!.textContent = `density: ${table.density}`
              button('wc-resizeable')!.textContent = `resizeable: ${table.resizeable}`
              button('wc-draggable')!.textContent = `draggable: ${table.draggable}`
              button('wc-pad')!.textContent = `padEmptyRows: ${table.padEmptyRows}`
              button('wc-fill')!.textContent = `fillHeight: ${table.fillHeight}`
              button('wc-empty')!.textContent = `empty: ${emptyMode}`
              button('wc-page-size')!.textContent = `pageSize: ${table.pageSize}`
            }
            button('wc-density')?.addEventListener('click', () => {
              table.density = table.density === 'compact' ? 'comfortable' : 'compact'
              paintControls()
            })
            button('wc-resizeable')?.addEventListener('click', () => {
              table.resizeable = !table.resizeable
              paintControls()
            })
            button('wc-draggable')?.addEventListener('click', () => {
              table.draggable = !table.draggable
              paintControls()
            })
            button('wc-pad')?.addEventListener('click', () => {
              table.padEmptyRows = !table.padEmptyRows
              paintControls()
            })
            button('wc-fill')?.addEventListener('click', () => {
              table.fillHeight = !table.fillHeight
              paintControls()
            })
            button('wc-empty')?.addEventListener('click', () => {
              emptyMode = !emptyMode
              table.data = emptyMode ? [] : data
              paintControls()
            })
            button('wc-page-size')?.addEventListener('click', () => {
              table.pageSize = table.pageSize === 5 ? 8 : 5
              paintControls()
            })
            button('wc-loading')?.addEventListener('click', () => {
              table.loading = true
              window.setTimeout(() => { table.loading = false }, 900)
            })
            paintControls()

            let sortingText = 'budget:desc'
            let pageText = '1'
            let orderText = '(default)'
            let sizingText = '{}'
            let expandedText = '0'
            const paint = () => {
              out.textContent = `sort=${sortingText} · page=${pageText} · order=${orderText} · sizing=${sizingText} · expanded=${expandedText}`
            }

            el.addEventListener('sorting-change', event => {
              const detail = (event as CustomEvent<{ sorting: TableSortingState }>).detail
              sortingText = formatSorting(detail?.sorting ?? [])
              paint()
            })
            el.addEventListener('pagination-change', event => {
              const detail = (event as CustomEvent<{ pagination: { pageIndex: number } }>).detail
              pageText = String((detail?.pagination?.pageIndex ?? 0) + 1)
              paint()
            })
            el.addEventListener('column-order-change', event => {
              const detail = (event as CustomEvent<{ order: string[] }>).detail
              orderText = detail?.order?.join('›') || '(default)'
              paint()
            })
            el.addEventListener('column-sizing-change', event => {
              const detail = (event as CustomEvent<{ sizing: Record<string, number> }>).detail
              sizingText = JSON.stringify(detail?.sizing ?? {})
              paint()
            })
            el.addEventListener('expanded-change', event => {
              const detail = (event as CustomEvent<{ expanded: TableExpandedState }>).detail
              expandedText = formatExpanded(detail?.expanded ?? {})
              paint()
            })
          },
        )
      }}
    />
  )
}

function ReactTableFullDemo() {
  const [sorting, setSorting] = useState<TableSortingState>([{ id: 'progress', desc: true }])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [loading, setLoading] = useState(false)
  const [emptyMode, setEmptyMode] = useState(false)
  const [fillHeight, setFillHeight] = useState(false)
  const [padEmptyRows, setPadEmptyRows] = useState(true)
  const [resizeable, setResizeable] = useState(true)
  const [draggable, setDraggable] = useState(true)
  const [columnOrder, setColumnOrder] = useState<TableColumnOrderState>(defaultOrder)
  const [columnSizing, setColumnSizing] = useState<TableColumnSizingState>({})
  const [rowDraggable, setRowDraggable] = useState(true)
  const [rowOrder, setRowOrder] = useState<TableRowOrderState>([])
  const [expanded, setExpanded] = useState<TableExpandedState>({ '0': true })

  const getRowId = (row: TableRowData) => String(row.project ?? row.owner ?? '')

  const tableData = useMemo(() => (emptyMode ? [] : data), [emptyMode])
  const pageCount = Math.max(1, Math.ceil(tableData.length / pageSize) || 1)
  const lastPageRowCount = tableData.length % pageSize || (tableData.length ? pageSize : 0)
  const padHint =
    padEmptyRows && pageIndex === pageCount - 1 && lastPageRowCount > 0 && lastPageRowCount < pageSize
      ? `last page has ${lastPageRowCount} data rows + ${pageSize - lastPageRowCount} pad rows`
      : padEmptyRows
        ? 'padEmptyRows on — go to last page to see blank filler rows'
        : 'padEmptyRows off — last page is shorter'

  const result = [
    `sort=${formatSorting(sorting)}`,
    `page=${pageIndex + 1}/${pageCount} size=${pageSize}`,
    `padEmptyRows=${padEmptyRows}`,
    `expanded=${formatExpanded(expanded)}`,
    `order=${columnOrder.join('›')}`,
    `sizing=${Object.keys(columnSizing).length ? JSON.stringify(columnSizing) : '{}'}`,
    `density=${density}`,
    `resize=${resizeable}`,
    `drag=${draggable}`,
    `rowDrag=${rowDraggable}`,
    `rowOrder=${rowOrder.length ? rowOrder.join('›') : '(default)'}`,
    `fillHeight=${fillHeight}`,
  ].join(' · ')

  return (
    <div className="demo-stack table-demo" style={{ width: '100%' }}>
      <p className="table-demo-note">
        React full API tour. <strong>padEmptyRows</strong> only shows on the <strong>last page</strong> when
        data rows &lt; pageSize (blank rows keep table height stable). Use the toggle + “go last page”.
      </p>

      <div className="table-demo-toolbar">
        <HButton
          size="sm"
          variant="secondary"
          onClick={() => setDensity(d => (d === 'compact' ? 'comfortable' : 'compact'))}
        >
          density: {density}
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setPadEmptyRows(v => !v)}>
          padEmptyRows: {String(padEmptyRows)}
        </HButton>
        <HButton
          size="sm"
          variant="secondary"
          onClick={() => setPageIndex(Math.max(0, pageCount - 1))}
        >
          go last page
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setResizeable(v => !v)}>
          resizeable: {String(resizeable)}
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setDraggable(v => !v)}>
          draggable: {String(draggable)}
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setRowDraggable(v => !v)}>
          rowDraggable: {String(rowDraggable)}
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setFillHeight(v => !v)}>
          fillHeight: {String(fillHeight)}
        </HButton>
        <HButton
          size="sm"
          variant="secondary"
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => setLoading(false), 900)
          }}
        >
          flash loading
        </HButton>
        <HButton size="sm" variant="secondary" onClick={() => setEmptyMode(v => !v)}>
          empty: {String(emptyMode)}
        </HButton>
        <HButton
          size="sm"
          variant="secondary"
          onClick={() => setPageSize(s => (s === 5 ? 8 : 5))}
        >
          pageSize: {pageSize}
        </HButton>
        <HSpacer />
        <HTag tone="info">pin left: project · pin right: live</HTag>
      </div>
      <p className="table-demo-note">{padHint}</p>

      <div
        className={fillHeight ? 'table-demo-fill-host' : undefined}
        style={fillHeight ? { height: 420 } : undefined}
      >
        <HTable
          caption="Projects (React · full TableContract + escape hatches)"
          columns={columns}
          data={tableData}
          fillHeight={fillHeight}
          enableSorting
          sorting={sorting}
          onSortingChange={d => setSorting(d.sorting)}
          enablePagination
          pageSize={pageSize}
          pagination={{ pageIndex, pageSize }}
          onPaginationChange={d => {
            setPageIndex(d.pagination.pageIndex)
            setPageSize(d.pagination.pageSize)
          }}
          padEmptyRows={padEmptyRows}
          density={density}
          loading={loading}
          emptyText="No projects match filters (emptyText demo)"
          resizeable={resizeable}
          columnResizeMode="onChange"
          columnSizing={columnSizing}
          onColumnSizingChange={d => setColumnSizing(d.sizing)}
          draggable={draggable}
          columnOrder={columnOrder}
          onColumnOrderChange={d => setColumnOrder(d.order)}
          rowDraggable={rowDraggable}
          getRowId={getRowId}
          rowOrder={rowOrder}
          onRowOrderChange={d => setRowOrder(d.rowOrder)}
          enableExpanding
          lazyMount
          unmountOnExit={false}
          expanded={expanded}
          onExpandedChange={d => setExpanded(d.expanded)}
          getRowCanExpand={row => Boolean(row.notes)}
          renderExpanded={row => {
            const project = String(row.original.project ?? '')
            const owner = String(row.original.owner ?? '')
            const notes = String(row.original.notes ?? '—')
            const progress = String(row.original.progress ?? '')
            return (
              <div className="table-demo-expanded">
                <span>
                  <strong>{project}</strong>
                  <small>Project</small>
                </span>
                <span>
                  <strong>{owner}</strong>
                  <small>Owner</small>
                </span>
                <span>
                  <strong>{progress}%</strong>
                  <small>Progress</small>
                </span>
                <span>
                  <strong>{notes}</strong>
                  <small>Notes (renderExpanded)</small>
                </span>
              </div>
            )
          }}
        />
      </div>

      <span className="demo-result">{result}</span>

      <HVStack gap="sm" className="table-demo-legend">
        <HStack gap="sm" wrap>
          <HTag tone="neutral">cellType: text</HTag>
          <HTag tone="success">tag / badge / boolean</HTag>
          <HTag tone="info">number · datetime · progress</HTag>
        </HStack>
        <p className="table-demo-note">
          Drag non-pinned headers to reorder · drag column edges when resizeable · expand rows for
          detail · last page uses padEmptyRows for stable height.
        </p>
      </HVStack>
    </div>
  )
}

export default function TableView() {
  const definition: ViewDefinition = {
    apiKey: 'table',
    title: 'Table',
    description:
      'TanStack HTable aligned across React / Vue / WC: cellTypes, pin, sort, page, padEmptyRows, density, fillHeight, resizeable, draggable column order, row expand and adapter-specific detail rendering.',
    reactDemo: <ReactTableFullDemo />,
    vueDemo: VueTableDemo,
    webDemo: <TableWebDemo />,
  }
  return <ComponentPage {...definition} />
}
