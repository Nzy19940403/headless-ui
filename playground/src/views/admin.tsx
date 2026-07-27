import { useMemo, useState } from 'react'
import { HButton, HCard, HDialog, HProgress, HTable, HTabs, HTag, HToggle } from '@demo/ui-react'
import type { TableColumnContract, TableRowData, TagTone } from '@demo/ui-core'

type FleetAsset = TableRowData & {
  asset: string
  model: string
  site: string
  status: string
  health: number
  utilization: number
  engineHours: number
  fuelBurn: number
  nextService: string
  connected: boolean
}

type Alert = {
  id: string
  time: string
  asset: string
  title: string
  detail: string
  severity: 'Critical' | 'Warning' | 'Info'
}

const fleetColumns: TableColumnContract[] = [
  { accessorKey: 'asset', header: 'Asset', minSize: 150 },
  { accessorKey: 'model', header: 'Model', size: 120 },
  { accessorKey: 'site', header: 'Site', minSize: 150 },
  { accessorKey: 'status', header: 'Status', cellType: 'tag', size: 120 },
  { accessorKey: 'health', header: 'Health', cellType: 'progress', size: 150 },
  { accessorKey: 'utilization', header: 'Util.', cellType: 'progress', size: 140 },
  { accessorKey: 'engineHours', header: 'Hours', cellType: 'number', align: 'right', size: 95 },
  { accessorKey: 'fuelBurn', header: 'L / hr', cellType: 'number', align: 'right', size: 90 },
  { accessorKey: 'nextService', header: 'Next service', cellType: 'datetime', size: 160 },
  { accessorKey: 'connected', header: 'Live', cellType: 'boolean', align: 'center', size: 72, enableSorting: false },
]

const fleetAssets: FleetAsset[] = [
  {
    asset: 'EX-701',
    model: 'Hydraulic Excavator 390',
    site: 'North Ridge Quarry',
    status: 'Online',
    health: 92,
    utilization: 86,
    engineHours: 12840,
    fuelBurn: 38,
    nextService: '2026-07-29T08:00:00+08:00',
    connected: true,
  },
  {
    asset: 'WL-214',
    model: 'Wheel Loader 982',
    site: 'Harbor Aggregate Yard',
    status: 'Warning',
    health: 64,
    utilization: 72,
    engineHours: 9360,
    fuelBurn: 31,
    nextService: '2026-07-27T16:30:00+08:00',
    connected: true,
  },
  {
    asset: 'DZ-118',
    model: 'Track Dozer D8',
    site: 'West Cut Earthworks',
    status: 'Service Due',
    health: 58,
    utilization: 41,
    engineHours: 15520,
    fuelBurn: 45,
    nextService: '2026-07-28T10:00:00+08:00',
    connected: true,
  },
  {
    asset: 'ADT-036',
    model: 'Articulated Truck 745',
    site: 'North Ridge Quarry',
    status: 'Online',
    health: 88,
    utilization: 91,
    engineHours: 7810,
    fuelBurn: 52,
    nextService: '2026-08-03T09:00:00+08:00',
    connected: true,
  },
  {
    asset: 'GR-052',
    model: 'Motor Grader 160',
    site: 'Route 42 Subgrade',
    status: 'Idle',
    health: 76,
    utilization: 24,
    engineHours: 11040,
    fuelBurn: 19,
    nextService: '2026-08-01T13:30:00+08:00',
    connected: false,
  },
  {
    asset: 'CP-009',
    model: 'Soil Compactor 815',
    site: 'South Logistics Pad',
    status: 'Critical',
    health: 31,
    utilization: 12,
    engineHours: 14205,
    fuelBurn: 27,
    nextService: '2026-07-27T14:00:00+08:00',
    connected: true,
  },
  {
    asset: 'EX-336',
    model: 'Hydraulic Excavator 336',
    site: 'Metro Line 6',
    status: 'Online',
    health: 84,
    utilization: 79,
    engineHours: 6940,
    fuelBurn: 29,
    nextService: '2026-08-05T08:30:00+08:00',
    connected: true,
  },
]

const alerts: Alert[] = [
  {
    id: 'a-01',
    time: '13:42',
    asset: 'CP-009',
    title: 'Hydraulic temperature above threshold',
    detail: 'Recommend stopping the compactor after current pass and dispatching field service.',
    severity: 'Critical',
  },
  {
    id: 'a-02',
    time: '12:18',
    asset: 'WL-214',
    title: 'Fuel efficiency drift detected',
    detail: 'Burn rate is 14% higher than the 7-day baseline under similar payload.',
    severity: 'Warning',
  },
  {
    id: 'a-03',
    time: '10:05',
    asset: 'DZ-118',
    title: 'Planned service window approaching',
    detail: 'Service kit D8-400h is staged at West Cut Earthworks.',
    severity: 'Info',
  },
]

const serviceJobs = [
  { id: 'WO-8821', title: 'Replace hydraulic return filter', asset: 'CP-009', owner: 'Field Team A', eta: 'Today 16:00', tone: 'danger' },
  { id: 'WO-8817', title: 'Inspect bucket linkage wear', asset: 'EX-701', owner: 'Night Shift', eta: 'Jul 28 08:30', tone: 'warning' },
  { id: 'WO-8798', title: 'Download ECM logs', asset: 'WL-214', owner: 'Remote Ops', eta: 'Jul 28 11:00', tone: 'info' },
] satisfies Array<{ id: string; title: string; asset: string; owner: string; eta: string; tone: TagTone }>

const alertTone: Record<Alert['severity'], TagTone> = {
  Critical: 'danger',
  Warning: 'warning',
  Info: 'info',
}

export default function AdminView() {
  const [autonomousDispatch, setAutonomousDispatch] = useState(true)
  const [pageLabel, setPageLabel] = useState('1')
  const [sortingLabel, setSortingLabel] = useState('health:desc')

  const metrics = useMemo(() => {
    const online = fleetAssets.filter(asset => asset.connected).length
    const critical = fleetAssets.filter(asset => asset.status === 'Critical').length
    const avgUtilization = Math.round(
      fleetAssets.reduce((sum, asset) => sum + asset.utilization, 0) / fleetAssets.length,
    )
    const avgHealth = Math.round(fleetAssets.reduce((sum, asset) => sum + asset.health, 0) / fleetAssets.length)

    return [
      { label: 'Connected assets', value: `${online}/${fleetAssets.length}`, detail: 'Telemetry streaming', tone: 'success' },
      { label: 'Critical alerts', value: String(critical), detail: 'Requires dispatch', tone: 'danger' },
      { label: 'Fleet utilization', value: `${avgUtilization}%`, detail: '+8% vs last shift', tone: 'warning' },
      { label: 'Health index', value: `${avgHealth}%`, detail: 'Weighted by engine hours', tone: 'info' },
    ] satisfies Array<{ label: string; value: string; detail: string; tone: TagTone }>
  }, [])

  return (
    <main className="admin-command">
      <section className="admin-command__hero">
        <div className="admin-command__kicker">
          <span className="admin-command__mark">HC</span>
          Heavy equipment command center
        </div>
        <div className="admin-command__hero-grid">
          <div>
            <h1>Fleet Command</h1>
            <p className="admin-command__intro">
              Industrial fleet operations dashboard assembled from the shared H component library.
              The visual language is high-contrast, safety-first, and machinery focused.
            </p>
          </div>
          <div className="admin-command__actions">
            <HToggle
              checked={autonomousDispatch}
              onCheckedChange={details => setAutonomousDispatch(details.checked)}
            >
              Auto dispatch
            </HToggle>
            <HButton variant="secondary">Export shift report</HButton>
            <HDialog
              trigger="Create work order"
              title="Create work order"
              description="Demo action composed with the shared dialog wrapper. In a real fleet system this would route the selected asset to field service."
            >
              <div className="admin-command__dialog">
                <p>Suggested asset: CP-009</p>
                <p>Priority: Critical hydraulic inspection</p>
                <HButton>Dispatch technician</HButton>
              </div>
            </HDialog>
          </div>
        </div>
      </section>

      <section className="admin-command__metrics" aria-label="Fleet metrics">
        {metrics.map(metric => (
          <HCard key={metric.label} className="admin-command__metric">
            <span className="admin-command__metric-label">{metric.label}</span>
            <strong className="admin-command__metric-value">{metric.value}</strong>
            <span className="admin-command__metric-detail">
              <HTag tone={metric.tone}>{metric.detail}</HTag>
            </span>
          </HCard>
        ))}
      </section>

      <section className="admin-command__layout">
        <HCard className="admin-command__map-panel">
          <div className="admin-command__panel-head">
            <div>
              <span className="admin-command__section-label">Live site map</span>
              <h2>North Ridge Quarry</h2>
            </div>
            <HTag tone="warning">3 active zones</HTag>
          </div>
          <div className="admin-command__site-map" aria-label="Illustrated quarry operation map">
            <span className="admin-command__haul-road" />
            <span className="admin-command__zone admin-command__zone--excavator">EX-701</span>
            <span className="admin-command__zone admin-command__zone--loader">WL-214</span>
            <span className="admin-command__zone admin-command__zone--truck">ADT-036</span>
            <span className="admin-command__zone admin-command__zone--critical">CP-009</span>
          </div>
          <div className="admin-command__map-footer">
            <div>
              <span>Payload moved</span>
              <strong>18,420 t</strong>
            </div>
            <div>
              <span>Idle loss</span>
              <strong>2.8 hr</strong>
            </div>
            <div>
              <span>Shift target</span>
              <strong>91%</strong>
            </div>
          </div>
        </HCard>

        <div className="admin-command__side-stack">
          <HCard className="admin-command__health-panel">
            <div className="admin-command__panel-head">
              <div>
                <span className="admin-command__section-label">Fleet health</span>
                <h2>Risk distribution</h2>
              </div>
              <HTag tone="success">Live</HTag>
            </div>
            <div className="admin-command__health-bars">
              <HProgress label="Healthy" value={68} />
              <HProgress label="Watch" value={23} />
              <HProgress label="Critical" value={9} />
            </div>
          </HCard>

          <HCard className="admin-command__alert-panel">
            <div className="admin-command__panel-head">
              <div>
                <span className="admin-command__section-label">Priority alerts</span>
                <h2>Event stream</h2>
              </div>
            </div>
            <ol className="admin-command__alerts">
              {alerts.map(alert => (
                <li key={alert.id} className="admin-command__alert">
                  <span className="admin-command__alert-time">{alert.time}</span>
                  <div>
                    <div className="admin-command__alert-title">
                      <strong>{alert.asset}</strong>
                      <HTag tone={alertTone[alert.severity]}>{alert.severity}</HTag>
                    </div>
                    <p>{alert.title}</p>
                    <small>{alert.detail}</small>
                  </div>
                </li>
              ))}
            </ol>
          </HCard>
        </div>
      </section>

      <HCard className="admin-command__table-panel">
        <div className="admin-command__panel-head">
          <div>
            <span className="admin-command__section-label">Asset registry</span>
            <h2>Equipment telemetry</h2>
          </div>
          <span className="admin-command__table-state">
            Sort: {sortingLabel} · Page: {pageLabel}
          </span>
        </div>
        <HTable
          caption="Sortable fleet table powered by TanStack Table through HTable."
          columns={fleetColumns}
          data={fleetAssets}
          defaultSorting={[{ id: 'health', desc: true }]}
          enableSorting
          enablePagination
          pageSize={5}
          density="compact"
          onSortingChange={details => {
            setSortingLabel(details.sorting.map(item => `${item.id}:${item.desc ? 'desc' : 'asc'}`).join(', ') || '(none)')
          }}
          onPaginationChange={details => {
            setPageLabel(String(details.pagination.pageIndex + 1))
          }}
        />
      </HCard>

      <section className="admin-command__bottom-grid">
        <HCard className="admin-command__service-panel">
          <div className="admin-command__panel-head">
            <div>
              <span className="admin-command__section-label">Maintenance</span>
              <h2>Work queue</h2>
            </div>
            <HButton variant="secondary" size="sm">View all</HButton>
          </div>
          <div className="admin-command__jobs">
            {serviceJobs.map(job => (
              <article key={job.id} className="admin-command__job">
                <div>
                  <span>{job.id}</span>
                  <strong>{job.title}</strong>
                  <small>
                    {job.asset} · {job.owner}
                  </small>
                </div>
                <div>
                  <HTag tone={job.tone}>{job.eta}</HTag>
                </div>
              </article>
            ))}
          </div>
        </HCard>

        <HCard className="admin-command__ops-panel">
          <HTabs
            defaultValue="shift"
            items={[
              {
                value: 'shift',
                label: 'Shift brief',
                content: (
                  <div className="admin-command__brief">
                    <p>Keep haul road B open for ADT-036 traffic. Route compactors away from sector C until hydraulic inspection is complete.</p>
                    <HButton size="sm">Acknowledge brief</HButton>
                  </div>
                ),
              },
              {
                value: 'parts',
                label: 'Parts',
                content: (
                  <div className="admin-command__brief">
                    <p>Critical stock: hydraulic filters, 390 bucket teeth, D8 undercarriage kit.</p>
                    <HButton variant="secondary" size="sm">Open inventory</HButton>
                  </div>
                ),
              },
              {
                value: 'safety',
                label: 'Safety',
                content: (
                  <div className="admin-command__brief">
                    <p>Two proximity events recorded near crusher feed. Review geofence warnings before night shift.</p>
                    <HButton variant="secondary" size="sm">Review events</HButton>
                  </div>
                ),
              },
            ]}
          />
        </HCard>
      </section>
    </main>
  )
}
