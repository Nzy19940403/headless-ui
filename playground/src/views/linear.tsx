import { useMemo, useState } from 'react'
import {
  HButton, HCard, HChart, HGrid, HSplit, HStack, HTable, HTabs, HTag, HAvatar, HSelect,
  HSpacer, HContainer, HProgress, HVStack, HDrawer, HDialog, HSeparator,
} from '@demo/ui-react'
import type { ChartSeriesContract, TableColumnContract, TableRowData, TagTone } from '@demo/ui-core'

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */

const days30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 6, 27 - (29 - i))
  return `${d.getMonth() + 1}/${d.getDate()}`
})

const visitsSeries: ChartSeriesContract[] = [
  { name: 'Visitors', data: days30.map(() => Math.round(8000 + Math.random() * 12000)) },
  { name: 'Page Views', data: days30.map(() => Math.round(15000 + Math.random() * 25000)) },
]

const topPages: TableRowData[] = [
  { path: '/', visits: 142_380, unique: 98_240, avgTime: '3m 42s', bounce: '32%' },
  { path: '/pricing', visits: 48_210, unique: 32_150, avgTime: '2m 18s', bounce: '28%' },
  { path: '/docs/getting-started', visits: 36_840, unique: 22_460, avgTime: '5m 12s', bounce: '18%' },
  { path: '/blog/analytics-update', visits: 21_500, unique: 14_300, avgTime: '4m 05s', bounce: '22%' },
  { path: '/login', visits: 18_720, unique: 15_100, avgTime: '1m 30s', bounce: '45%' },
  { path: '/signup', visits: 12_450, unique: 10_200, avgTime: '2m 05s', bounce: '38%' },
  { path: '/changelog', visits: 9_800, unique: 7_200, avgTime: '3m 30s', bounce: '25%' },
]

const pageColumns: TableColumnContract[] = [
  { accessorKey: 'path', header: 'Page', minSize: 200 },
  { accessorKey: 'visits', header: 'Visits', cellType: 'number', align: 'right', size: 120 },
  { accessorKey: 'unique', header: 'Unique', cellType: 'number', align: 'right', size: 120 },
  { accessorKey: 'avgTime', header: 'Avg Time', size: 110 },
  { accessorKey: 'bounce', header: 'Bounce', size: 100 },
]

const deployments = [
  { id: 'dpl-1', branch: 'main', commit: 'feat: add real-time analytics', status: 'ready', date: '2 min ago', author: 'KK', duration: '45s' },
  { id: 'dpl-2', branch: 'main', commit: 'fix: pagination off-by-one', status: 'ready', date: '18 min ago', author: 'AL', duration: '38s' },
  { id: 'dpl-3', branch: 'feat/dashboard', commit: 'WIP: new chart components', status: 'building', date: '1h ago', author: 'KK', duration: '—' },
  { id: 'dpl-4', branch: 'main', commit: 'chore: update deps', status: 'ready', date: '3h ago', author: 'BZ', duration: '42s' },
  { id: 'dpl-5', branch: 'main', commit: 'refactor: theme system', status: 'error', date: '5h ago', author: 'CW', duration: '1m 12s' },
]

const realtimeSessions = [
  { path: '/pricing', user: 'Tokyo · JP', time: '0s ago' },
  { path: '/docs', user: 'Frankfurt · DE', time: '2s ago' },
  { path: '/blog', user: 'São Paulo · BR', time: '5s ago' },
  { path: '/login', user: 'Sydney · AU', time: '8s ago' },
  { path: '/', user: 'New York · US', time: '12s ago' },
]

const rangeItems = [
  { value: '30m', label: 'Last 30 min' },
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
]

const nf = (n: number) => n.toLocaleString()

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function VercelView() {
  const [tab, setTab] = useState('overview')
  const [range, setRange] = useState('30d')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const kpis = useMemo(() => [
    { label: 'Total Visits', value: nf(289_500), change: '+12.3%', tone: 'success' as TagTone },
    { label: 'Unique Visitors', value: nf(176_300), change: '+8.1%', tone: 'success' as TagTone },
    { label: 'Avg. Session', value: '4m 12s', change: '-2.4%', tone: 'warning' as TagTone },
    { label: 'Bounce Rate', value: '29.8%', change: '-1.2%', tone: 'success' as TagTone },
  ], [])

  const statusTone: Record<string, TagTone> = { ready: 'success', building: 'warning', error: 'danger' }

  const tabContent = useMemo(() => ({
    value: 'overview',
    label: 'Overview',
    content: null,
  }), [])

  return (
    <main className="vercel-shell">
      {/* Top navigation bar */}
      <header className="vercel-topbar">
        <div className="vercel-topbar__left">
          <span className="vercel-topbar__brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>
          </span>
          <span className="vercel-topbar__sep">/</span>
          <span className="vercel-topbar__project">ui-library</span>
          <span className="vercel-topbar__env">production</span>
          <HButton size="sm" variant="secondary">Visit</HButton>
        </div>
        <div className="vercel-topbar__right">
          <HSelect
            items={rangeItems}
            value={range}
            onValueChange={d => setRange(d.value)}
          />
          <div className="vercel-topbar__search">
            <span className="vercel-topbar__search-icon">⌕</span>
            <input className="vercel-topbar__search-input" placeholder="Search...  " />
          </div>
          <HAvatar size="sm" alt="User" fallback="KK" />
        </div>
      </header>

      {/* Tabs */}
      <div className="vercel-tabs">
        <HTabs
          defaultValue="overview"
          items={[
            {
              value: 'overview',
              label: 'Overview',
              content: (
                <HVStack gap="lg">
                  {/* KPI row */}
                  <HGrid columns="1 sm:2 lg:4" gap="md">
                    {kpis.map(k => (
                      <HCard key={k.label} className="vercel-kpi">
                        <span className="vercel-kpi__label">{k.label}</span>
                        <div className="vercel-kpi__row">
                          <strong className="vercel-kpi__value">{k.value}</strong>
                          <HTag tone={k.tone}>{k.change}</HTag>
                        </div>
                      </HCard>
                    ))}
                  </HGrid>

                  {/* Chart + Real-time */}
                  <HSplit ratio="sidebar-right" sidebarWidth="300px" gap="md" collapseBelow="lg">
                    <HCard className="vercel-chart-card">
                      <HVStack gap="md">
                        <HStack align="center">
                          <HVStack gap="2xs">
                            <span className="vercel-chart-card__label">TRAFFIC</span>
                            <h2>Visitors & Page Views</h2>
                          </HVStack>
                          <HSpacer />
                          <div className="vercel-chart-card__legend">
                            <span className="vercel-legend-dot vercel-legend-dot--blue" />
                            <span className="vercel-legend-label">Visitors</span>
                            <span className="vercel-legend-dot vercel-legend-dot--green" />
                            <span className="vercel-legend-label">Page Views</span>
                          </div>
                        </HStack>
                        <HChart
                          type="area"
                          categories={days30}
                          series={visitsSeries}
                          smooth
                          height={280}
                        />
                      </HVStack>
                    </HCard>

                    {/* Real-time sidebar */}
                    <HCard className="vercel-realtime-card">
                      <HVStack gap="md">
                        <HStack align="center">
                          <span className="vercel-realtime-dot" />
                          <h3 className="vercel-realtime-title">Real-time</h3>
                          <HSpacer />
                          <HTag tone="success">Live</HTag>
                        </HStack>
                        <div className="vercel-realtime-list">
                          {realtimeSessions.map((s, i) => (
                            <div key={i} className="vercel-realtime-row">
                              <div>
                                <span className="vercel-realtime-path">{s.path}</span>
                                <span className="vercel-realtime-user">{s.user}</span>
                              </div>
                              <span className="vercel-realtime-time">{s.time}</span>
                            </div>
                          ))}
                        </div>
                      </HVStack>
                    </HCard>
                  </HSplit>

                  {/* Top pages + Deployments */}
                  <HSplit ratio="2:1" gap="md" collapseBelow="lg">
                    <HCard className="vercel-card-head">
                      <HVStack gap="md">
                        <HStack align="center">
                          <HVStack gap="2xs">
                            <span className="vercel-chart-card__label">ANALYTICS</span>
                            <h2>Top Pages</h2>
                          </HVStack>
                          <HSpacer />
                          <HButton variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>View all</HButton>
                        </HStack>
                        <HTable
                          columns={pageColumns}
                          data={topPages}
                          density="compact"
                          caption="Most visited pages"
                        />
                      </HVStack>
                    </HCard>

                    <HCard className="vercel-card-head">
                      <HVStack gap="md">
                        <HStack align="center">
                          <HVStack gap="2xs">
                            <span className="vercel-chart-card__label">DEPLOYMENTS</span>
                            <h2>Recent Activity</h2>
                          </HVStack>
                          <HSpacer />
                          <HDialog
                            trigger="New deploy"
                            title="Deploy project"
                          >
                            <p style={{ color: 'var(--vercel-muted)', fontSize: 13, margin: 0 }}>
                              Deploy the latest commit of <strong>main</strong> to production?
                            </p>
                            <HButton>Deploy</HButton>
                          </HDialog>
                        </HStack>
                        <div className="vercel-deploy-list">
                          {deployments.map(d => (
                            <div key={d.id} className="vercel-deploy-row">
                              <div className="vercel-deploy-status">
                                <span className={`vercel-deploy-dot vercel-deploy-dot--${d.status}`} />
                              </div>
                              <div className="vercel-deploy-info">
                                <div className="vercel-deploy-top">
                                  <span className="vercel-deploy-branch">{d.branch}</span>
                                  <span className="vercel-deploy-commit">{d.commit}</span>
                                </div>
                                <div className="vercel-deploy-meta">
                                  <HTag tone={statusTone[d.status] || 'neutral'}>{d.status}</HTag>
                                  <span>{d.date}</span>
                                  <span>{d.duration}</span>
                                </div>
                              </div>
                              <HAvatar size="sm" alt={d.author} fallback={d.author} />
                            </div>
                          ))}
                        </div>
                      </HVStack>
                    </HCard>
                  </HSplit>
                </HVStack>
              ),
            },
            {
              value: 'analytics',
              label: 'Analytics',
              content: (
                <HVStack gap="lg">
                  <HCard className="vercel-chart-card">
                    <HVStack gap="md">
                      <HStack align="center">
                        <HVStack gap="2xs">
                          <span className="vercel-chart-card__label">ANALYTICS</span>
                          <h2>Full Traffic Report</h2>
                        </HVStack>
                        <HSpacer />
                        <HTag tone="info">30 day window</HTag>
                      </HStack>
                      <HChart
                        type="area"
                        categories={days30}
                        series={visitsSeries}
                        smooth
                        height={320}
                        legend
                      />
                    </HVStack>
                  </HCard>

                  <HGrid columns="1 lg:2" gap="md">
                    <HCard>
                      <HVStack gap="sm">
                        <HStack align="center">
                          <h3>Top Referrers</h3>
                          <HSpacer />
                          <HTag tone="neutral">Source breakdown</HTag>
                        </HStack>
                        <div className="vercel-referrers">
                          {[
                            { name: 'google.com', pct: 42 },
                            { name: 'github.com', pct: 18 },
                            { name: 'twitter.com', pct: 12 },
                            { name: 'news.ycombinator.com', pct: 8 },
                            { name: 'Direct / bookmark', pct: 20 },
                          ].map(r => (
                            <div key={r.name} className="vercel-referrer-row">
                              <span className="vercel-referrer-name">{r.name}</span>
                              <div className="vercel-referrer-bar-wrap">
                                <div className="vercel-referrer-bar" style={{ width: `${r.pct}%` }} />
                              </div>
                              <span className="vercel-referrer-pct">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </HVStack>
                    </HCard>

                    <HCard>
                      <HVStack gap="sm">
                        <HStack align="center">
                          <h3>Top Devices</h3>
                          <HSpacer />
                          <HTag tone="neutral">Desktop vs Mobile</HTag>
                        </HStack>
                        <div className="vercel-referrers">
                          {[
                            { name: 'Desktop', pct: 62 },
                            { name: 'Mobile', pct: 28 },
                            { name: 'Tablet', pct: 7 },
                            { name: 'Other', pct: 3 },
                          ].map(r => (
                            <div key={r.name} className="vercel-referrer-row">
                              <span className="vercel-referrer-name">{r.name}</span>
                              <div className="vercel-referrer-bar-wrap">
                                <div className="vercel-referrer-bar vercel-referrer-bar--alt" style={{ width: `${r.pct}%` }} />
                              </div>
                              <span className="vercel-referrer-pct">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </HVStack>
                    </HCard>
                  </HGrid>

                  <HCard className="vercel-card-head">
                    <HVStack gap="md">
                      <HStack align="center">
                        <HVStack gap="2xs">
                          <span className="vercel-chart-card__label">DETAIL</span>
                          <h2>Page-by-Page Breakdown</h2>
                        </HVStack>
                        <HSpacer />
                        <HButton variant="secondary" size="sm">Export CSV</HButton>
                      </HStack>
                      <HTable
                        columns={pageColumns}
                        data={topPages}
                        enableSorting
                        enablePagination
                        pageSize={5}
                        density="compact"
                      />
                    </HVStack>
                  </HCard>
                </HVStack>
              ),
            },
            {
              value: 'settings',
              label: 'Settings',
              content: (
                <HCard>
                  <HVStack gap="lg" style={{ padding: '8px 0' }}>
                    <HVStack gap="sm">
                      <h3 style={{ margin: 0 }}>General</h3>
                      <div className="vercel-settings-row">
                        <span>Project name</span>
                        <span className="vercel-settings-value">ui-library</span>
                      </div>
                      <div className="vercel-settings-row">
                        <span>Framework</span>
                        <span className="vercel-settings-value">Vite + React</span>
                      </div>
                      <div className="vercel-settings-row">
                        <span>Production branch</span>
                        <span className="vercel-settings-value">main</span>
                      </div>
                    </HVStack>
                    <HSeparator />
                    <HVStack gap="sm">
                      <h3 style={{ margin: 0 }}>Domains</h3>
                      <div className="vercel-settings-row">
                        <span>ui-library.vercel.app</span>
                        <HTag tone="success">Active</HTag>
                      </div>
                      <div className="vercel-settings-row">
                        <span>ui-library.com</span>
                        <HTag tone="warning">Pending DNS</HTag>
                      </div>
                    </HVStack>
                  </HVStack>
                </HCard>
              ),
            },
          ]}
        />
      </div>

      {/* Drawer - full page list */}
      <HDrawer
        open={drawerOpen}
        onOpenChange={d => setDrawerOpen(d.open)}
        title="All Pages"
        description="Complete list of tracked pages"
      >
        <HTable
          columns={pageColumns}
          data={topPages}
          density="compact"
        />
      </HDrawer>
    </main>
  )
}
