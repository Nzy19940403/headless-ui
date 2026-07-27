import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HTable } from '@demo/ui-react'
import { HTable as VueHTable } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import type { TableColumnContract, TableRowData, TableSortingState } from '@demo/ui-core'

/** Business-style columns: text / tag / badge / progress / number / datetime / boolean */
const columns: TableColumnContract[] = [
  { accessorKey: 'project', header: 'Project', minSize: 140 },
  { accessorKey: 'owner', header: 'Owner', size: 120 },
  { accessorKey: 'status', header: 'Status', cellType: 'tag', size: 110 },
  { accessorKey: 'priority', header: 'Priority', cellType: 'badge', size: 100 },
  { accessorKey: 'progress', header: 'Progress', cellType: 'progress', size: 140 },
  { accessorKey: 'budget', header: 'Budget', cellType: 'number', size: 100 },
  { accessorKey: 'updatedAt', header: 'Updated', cellType: 'datetime', size: 150 },
  { accessorKey: 'active', header: 'Live', cellType: 'boolean', size: 72, enableSorting: false },
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
  },
]

const PAGE_SIZE = 5

const VueTableDemo = defineComponent({
  name: 'VueTableDemo',
  setup() {
    const sortingLabel = ref('(none)')
    const pageLabel = ref('1')
    return () =>
      h('div', { class: 'demo-stack', style: 'width:100%' }, [
        h(VueHTable, {
          caption: 'Projects (Vue · fixed row height · padEmptyRows · cellTypes)',
          columns,
          data,
          enableSorting: true,
          enablePagination: true,
          pageSize: PAGE_SIZE,
          density: 'comfortable',
          // Uncontrolled: adapter manages sorting/pagination; events are notifications
          'onSorting-change': (d: { sorting: TableSortingState }) => {
            sortingLabel.value =
              d.sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(', ') || '(none)'
          },
          'onPagination-change': (d: { pagination: { pageIndex: number; pageSize: number } }) => {
            pageLabel.value = String(d.pagination.pageIndex + 1)
          },
        }),
        h(
          'span',
          { class: 'demo-result' },
          `Sorting: ${sortingLabel.value} · Page: ${pageLabel.value} · Last page pads empty rows so height stays fixed`,
        ),
      ])
  },
})

function TableWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-table
             caption="Projects (WC · fixed row height · padEmptyRows · cellTypes)"
             enable-sorting
             enable-pagination
             page-size="${PAGE_SIZE}"
             density="comfortable"
             empty-text="No rows"
             columns='${JSON.stringify(columns)}'
             data='${JSON.stringify(data)}'
             style="width:100%"
           ></h-table>
           <span class="demo-result">Sorting: (none) · Page: 1 · Last page pads empty rows so height stays fixed</span>`,
          host => {
            const el = host.querySelector('h-table')
            const out = host.querySelector('.demo-result')
            if (!el || !out) return

            let sortingText = '(none)'
            let pageText = '1'
            const paint = () => {
              out.textContent = `Sorting: ${sortingText} · Page: ${pageText} · Last page pads empty rows so height stays fixed`
            }

            el.addEventListener('sorting-change', event => {
              const detail = (event as CustomEvent<{ sorting: TableSortingState }>).detail
              sortingText =
                detail?.sorting?.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(', ') ||
                '(none)'
              paint()
            })
            el.addEventListener('pagination-change', event => {
              const detail = (event as CustomEvent<{ pagination: { pageIndex: number } }>).detail
              pageText = String((detail?.pagination?.pageIndex ?? 0) + 1)
              paint()
            })
          },
        )
      }}
    />
  )
}

export default function TableView() {
  const [sortingLabel, setSortingLabel] = useState('(none)')
  const [pageLabel, setPageLabel] = useState('1')

  const definition: ViewDefinition = {
    apiKey: 'table',
    title: 'Table',
    description:
      'TanStack Table (react / vue / lit). Fixed row height + padEmptyRows keep layout stable across pages. cellType: text | number | tag | badge | progress | datetime | boolean.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HTable
          caption="Projects (React · fixed row height · padEmptyRows · cellTypes)"
          columns={columns}
          data={data}
          enableSorting
          enablePagination
          pageSize={PAGE_SIZE}
          density="comfortable"
          onSortingChange={d => {
            setSortingLabel(
              d.sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(', ') || '(none)',
            )
          }}
          onPaginationChange={d => {
            setPageLabel(String(d.pagination.pageIndex + 1))
          }}
        />
        <span className="demo-result">
          Sorting: {sortingLabel} · Page: {pageLabel} · Last page pads empty rows so height stays
          fixed
        </span>
      </div>
    ),
    vueDemo: VueTableDemo,
    webDemo: <TableWebDemo />,
  }
  return <ComponentPage {...definition} />
}
