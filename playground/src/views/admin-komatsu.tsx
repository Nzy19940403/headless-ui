import { useMemo, useState } from 'react'
import {
  HButton,
  HCard,
  HContainer,
  HDialog,
  HGrid,
  HProgress,
  HSeparator,
  HSplit,
  HStack,
  HTable,
  HTabs,
  HTag,
  HToggle,
  HVStack,
  HSpacer,
} from '@demo/ui-react'
import type { TableColumnContract, TableRowData, TagTone } from '@demo/ui-core'

/**
 * Komatsu-inspired Smart Construction demo.
 * Brand cues: Komatsu blue, cool steel surfaces, precise Japanese industrial UI —
 * contrast with the Caterpillar yellow/black command center at #/admin.
 * Assembled only from shared H* components + layout primitives.
 */

type Machine = TableRowData & {
  unit: string
  model: string
  site: string
  status: string
  availability: number
  payload: number
  hours: number
  fuelRate: number
  nextPm: string
  telematics: boolean
}

type Alert = {
  id: string
  time: string
  unit: string
  title: string
  detail: string
  severity: 'Critical' | 'Warning' | 'Info'
}

const columns: TableColumnContract[] = [
  { accessorKey: 'unit', header: 'Unit', minSize: 110 },
  { accessorKey: 'model', header: 'Model', minSize: 150 },
  { accessorKey: 'site', header: 'Site', minSize: 140 },
  { accessorKey: 'status', header: 'Status', cellType: 'tag', size: 110 },
  { accessorKey: 'availability', header: 'Avail.', cellType: 'progress', size: 140 },
  { accessorKey: 'payload', header: 'Payload t', cellType: 'number', align: 'right', size: 100 },
  { accessorKey: 'hours', header: 'SMR h', cellType: 'number', align: 'right', size: 90 },
  { accessorKey: 'fuelRate', header: 'L/h', cellType: 'number', align: 'right', size: 80 },
  { accessorKey: 'nextPm', header: 'Next PM', cellType: 'datetime', size: 150 },
  { accessorKey: 'telematics', header: 'KOMTRAX', cellType: 'boolean', align: 'center', size: 96, enableSorting: false },
]

/** Komatsu-flavored model codes (PC excavator, WA loader, HD dump, D dozer…) */
const machines: Machine[] = [
  {
    unit: 'PC-210-01',
    model: 'PC210-11 Excavator',
    site: 'Osaka Bay Cut',
    status: 'Online',
    availability: 94,
    payload: 1.2,
    hours: 8420,
    fuelRate: 18,
    nextPm: '2026-08-02T09:00:00+09:00',
    telematics: true,
  },
  {
    unit: 'WA-380-04',
    model: 'WA380-8 Wheel Loader',
    site: 'Kobe Stockyard',
    status: 'Warning',
    availability: 71,
    payload: 3.6,
    hours: 11240,
    fuelRate: 22,
    nextPm: '2026-07-28T14:00:00+09:00',
    telematics: true,
  },
  {
    unit: 'HD-785-02',
    model: 'HD785-8 Dump Truck',
    site: 'Osaka Bay Cut',
    status: 'Online',
    availability: 88,
    payload: 91,
    hours: 15680,
    fuelRate: 68,
    nextPm: '2026-08-06T08:30:00+09:00',
    telematics: true,
  },
  {
    unit: 'D-65-PX',
    model: 'D65PXi-18 Dozer',
    site: 'Nara Earthworks',
    status: 'Idle',
    availability: 62,
    payload: 0,
    hours: 9340,
    fuelRate: 24,
    nextPm: '2026-07-30T11:00:00+09:00',
    telematics: false,
  },
  {
    unit: 'PC-490-07',
    model: 'PC490LC-11 Excavator',
    site: 'Metro Shield TBM',
    status: 'Online',
    availability: 91,
    payload: 2.8,
    hours: 6120,
    fuelRate: 36,
    nextPm: '2026-08-10T10:00:00+09:00',
    telematics: true,
  },
  {
    unit: 'HM-400-03',
    model: 'HM400-5 ADT',
    site: 'Kobe Stockyard',
    status: 'Critical',
    availability: 28,
    payload: 40,
    hours: 17890,
    fuelRate: 42,
    nextPm: '2026-07-27T16:00:00+09:00',
    telematics: true,
  },
  {
    unit: 'GD-655-01',
    model: 'GD655-7 Motor Grader',
    site: 'Route 163 Subgrade',
    status: 'Service Due',
    availability: 55,
    payload: 0,
    hours: 12010,
    fuelRate: 16,
    nextPm: '2026-07-29T09:30:00+09:00',
    telematics: true,
  },
  {
    unit: 'PC-138-US',
    model: 'PC138US-11 Excavator',
    site: 'Urban Utility Trench',
    status: 'Online',
    availability: 86,
    payload: 0.5,
    hours: 4210,
    fuelRate: 12,
    nextPm: '2026-08-12T08:00:00+09:00',
    telematics: true,
  },
]

const alerts: Alert[] = [
  {
    id: 'k-01',
    time: '14:06',
    unit: 'HM-400-03',
    title: 'Transmission oil pressure low',
    detail: 'KOMTRAX recommends derating payload and scheduling dealer service within shift.',
    severity: 'Critical',
  },
  {
    id: 'k-02',
    time: '12:44',
    unit: 'WA-380-04',
    title: 'Idle time above site baseline',
    detail: 'Smart Construction: 19% idle vs 11% site average on identical load cycle.',
    severity: 'Warning',
  },
  {
    id: 'k-03',
    time: '09:18',
    unit: 'D-65-PX',
    title: 'IMC blade calibration due',
    detail: 'Intelligent Machine Control reference stake check before next cut.',
    severity: 'Info',
  },
]

const workOrders = [
  { id: 'KO-2401', title: 'Replace transmission filter kit', unit: 'HM-400-03', owner: 'Dealer Field', eta: 'Today 17:30', tone: 'danger' as TagTone },
  { id: 'KO-2394', title: 'PC210 bucket pin inspection', unit: 'PC-210-01', owner: 'Site Team B', eta: 'Jul 28 09:00', tone: 'warning' as TagTone },
  { id: 'KO-2388', title: 'Upload IMC as-built surface', unit: 'D-65-PX', owner: 'Survey Desk', eta: 'Jul 28 13:00', tone: 'info' as TagTone },
]

const alertTone: Record<Alert['severity'], TagTone> = {
  Critical: 'danger',
  Warning: 'warning',
  Info: 'info',
}

export default function AdminKomatsuView() {
  const [smartConstruction, setSmartConstruction] = useState(true)
  const [pageLabel, setPageLabel] = useState('1')
  const [sortingLabel, setSortingLabel] = useState('availability:desc')

  const metrics = useMemo(() => {
    const linked = machines.filter(m => m.telematics).length
    const critical = machines.filter(m => m.status === 'Critical').length
    const avgAvail = Math.round(machines.reduce((s, m) => s + m.availability, 0) / machines.length)
    const payload = machines.reduce((s, m) => s + m.payload, 0)

    return [
      { label: 'KOMTRAX linked', value: `${linked}/${machines.length}`, detail: 'Telematics online', tone: 'success' as TagTone },
      { label: 'Critical units', value: String(critical), detail: 'Dealer dispatch', tone: 'danger' as TagTone },
      { label: 'Availability', value: `${avgAvail}%`, detail: 'Fleet SMR weighted', tone: 'info' as TagTone },
      { label: 'Cycle payload', value: `${payload.toFixed(1)} t`, detail: 'Current load models', tone: 'warning' as TagTone },
    ]
  }, [])

  return (
    <main className="komatsu-ops">
      <HContainer size="full" padded className="komatsu-ops__shell">
        <HVStack gap="lg">
          {/* Hero — cooler, calmer than CAT yellow command */}
          <section className="komatsu-ops__hero">
            <HStack gap="md" align="center" wrap className="komatsu-ops__hero-top">
              <span className="komatsu-ops__badge">KOMATSU</span>
              <HTag tone="info">Smart Construction</HTag>
              <HSpacer />
              <span className="komatsu-ops__eyebrow">Site operations · Asia Pacific</span>
            </HStack>

            <HSplit ratio="2:1" collapseBelow="md" gap="lg" className="komatsu-ops__hero-split">
              <HVStack gap="sm">
                <h1 className="komatsu-ops__title">Machine Control Desk</h1>
                <p className="komatsu-ops__lead">
                  Precision fleet view inspired by Komatsu Smart Construction: cool steel surfaces,
                  blue system accents, and data-first layout built with HContainer / HGrid / HSplit.
                </p>
              </HVStack>
              <HStack gap="sm" align="center" justify="end" wrap className="komatsu-ops__hero-actions">
                <HToggle
                  checked={smartConstruction}
                  onCheckedChange={d => setSmartConstruction(d.checked)}
                >
                  IMC assist
                </HToggle>
                <HButton variant="secondary">Export KOMTRAX</HButton>
                <HDialog
                  trigger="Open work order"
                  title="Open work order"
                  description="Demo dialog on the shared HDialog shell — would hand off to dealer service in production."
                >
                  <HVStack gap="sm" className="komatsu-ops__dialog">
                    <p>Suggested unit: HM-400-03</p>
                    <p>Priority: Transmission pressure · Critical</p>
                    <HButton>Notify dealer</HButton>
                  </HVStack>
                </HDialog>
              </HStack>
            </HSplit>
          </section>

          {/* KPI strip via HGrid */}
          <HGrid columns="1 sm:2 lg:4" gap="md" aria-label="Fleet KPIs">
            {metrics.map(m => (
              <HCard key={m.label} className="komatsu-ops__kpi">
                <HVStack gap="xs">
                  <span className="komatsu-ops__kpi-label">{m.label}</span>
                  <strong className="komatsu-ops__kpi-value">{m.value}</strong>
                  <HTag tone={m.tone}>{m.detail}</HTag>
                </HVStack>
              </HCard>
            ))}
          </HGrid>

          {/* Map + side column via HSplit */}
          <HSplit ratio="sidebar-right" sidebarWidth="340px" collapseBelow="lg" gap="md">
            <HCard className="komatsu-ops__panel">
              <HStack gap="md" align="start" className="komatsu-ops__panel-head">
                <HVStack gap="2xs">
                  <span className="komatsu-ops__section-label">Digital twin map</span>
                  <h2>Osaka Bay Cut</h2>
                </HVStack>
                <HSpacer />
                <HTag tone="info">4 machine pins</HTag>
              </HStack>

              <div className="komatsu-ops__map" aria-label="Site map illustration">
                <span className="komatsu-ops__grid-overlay" />
                <span className="komatsu-ops__lane" />
                <span className="komatsu-ops__pin komatsu-ops__pin--a">PC-210</span>
                <span className="komatsu-ops__pin komatsu-ops__pin--b">WA-380</span>
                <span className="komatsu-ops__pin komatsu-ops__pin--c">HD-785</span>
                <span className="komatsu-ops__pin komatsu-ops__pin--d">HM-400</span>
              </div>

              <HGrid columns="3" gap="sm" className="komatsu-ops__map-stats">
                <div>
                  <span>Cut volume</span>
                  <strong>12,860 m³</strong>
                </div>
                <div>
                  <span>Idle ratio</span>
                  <strong>11.4%</strong>
                </div>
                <div>
                  <span>Plan adherence</span>
                  <strong>96%</strong>
                </div>
              </HGrid>
            </HCard>

            <HVStack gap="md">
              <HCard className="komatsu-ops__panel">
                <HVStack gap="md">
                  <HStack align="center">
                    <HVStack gap="2xs">
                      <span className="komatsu-ops__section-label">Availability</span>
                      <h2>Fleet bands</h2>
                    </HVStack>
                    <HSpacer />
                    <HTag tone="success">Live</HTag>
                  </HStack>
                  <HVStack gap="md" className="komatsu-ops__bars">
                    <HProgress label="Operational" value={72} />
                    <HProgress label="Watch list" value={19} />
                    <HProgress label="Down / PM" value={9} />
                  </HVStack>
                </HVStack>
              </HCard>

              <HCard className="komatsu-ops__panel">
                <HVStack gap="sm">
                  <span className="komatsu-ops__section-label">Priority alerts</span>
                  <h2>Event stream</h2>
                  <HSeparator />
                  <ul className="komatsu-ops__alerts">
                    {alerts.map(a => (
                      <li key={a.id} className="komatsu-ops__alert">
                        <span className="komatsu-ops__alert-time">{a.time}</span>
                        <div>
                          <HStack gap="sm" align="center">
                            <strong>{a.unit}</strong>
                            <HTag tone={alertTone[a.severity]}>{a.severity}</HTag>
                          </HStack>
                          <p>{a.title}</p>
                          <small>{a.detail}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </HVStack>
              </HCard>
            </HVStack>
          </HSplit>

          {/* Telemetry table */}
          <HCard className="komatsu-ops__panel komatsu-ops__table-panel">
            <HStack gap="md" align="start" className="komatsu-ops__panel-head">
              <HVStack gap="2xs">
                <span className="komatsu-ops__section-label">Machine registry</span>
                <h2>KOMTRAX telemetry</h2>
              </HVStack>
              <HSpacer />
              <span className="komatsu-ops__meta">
                Sort: {sortingLabel} · Page: {pageLabel}
              </span>
            </HStack>
            <HTable
              caption="Komatsu-coded fleet rows via HTable (TanStack adapters)."
              columns={columns}
              data={machines}
              defaultSorting={[{ id: 'availability', desc: true }]}
              enableSorting
              enablePagination
              pageSize={5}
              density="compact"
              onSortingChange={d => {
                setSortingLabel(
                  d.sorting.map(s => `${s.id}:${s.desc ? 'desc' : 'asc'}`).join(', ') || '(none)',
                )
              }}
              onPaginationChange={d => setPageLabel(String(d.pagination.pageIndex + 1))}
            />
          </HCard>

          {/* Bottom: work queue + tabs */}
          <HSplit ratio="1:1" collapseBelow="md" gap="md">
            <HCard className="komatsu-ops__panel">
              <HStack align="center" className="komatsu-ops__panel-head">
                <HVStack gap="2xs">
                  <span className="komatsu-ops__section-label">Maintenance</span>
                  <h2>Work queue</h2>
                </HVStack>
                <HSpacer />
                <HButton variant="secondary" size="sm">
                  View all
                </HButton>
              </HStack>
              <HVStack gap="sm">
                {workOrders.map(wo => (
                  <article key={wo.id} className="komatsu-ops__job">
                    <div>
                      <span>{wo.id}</span>
                      <strong>{wo.title}</strong>
                      <small>
                        {wo.unit} · {wo.owner}
                      </small>
                    </div>
                    <HTag tone={wo.tone}>{wo.eta}</HTag>
                  </article>
                ))}
              </HVStack>
            </HCard>

            <HCard className="komatsu-ops__panel komatsu-ops__tabs-panel">
              <HTabs
                defaultValue="brief"
                items={[
                  {
                    value: 'brief',
                    label: 'Shift brief',
                    content: (
                      <HVStack gap="sm" className="komatsu-ops__brief">
                        <p>
                          Keep PC-490 on metro shield support. Hold HM-400 payload at 70% until
                          transmission pressure is cleared by dealer.
                        </p>
                        <HButton size="sm">Acknowledge</HButton>
                      </HVStack>
                    ),
                  },
                  {
                    value: 'parts',
                    label: 'Parts',
                    content: (
                      <HVStack gap="sm" className="komatsu-ops__brief">
                        <p>
                          Staged: HM400 filter kit, PC210 bucket teeth, D65 IMC antenna mount.
                        </p>
                        <HButton variant="secondary" size="sm">
                          Open inventory
                        </HButton>
                      </HVStack>
                    ),
                  },
                  {
                    value: 'safety',
                    label: 'Safety',
                    content: (
                      <HVStack gap="sm" className="komatsu-ops__brief">
                        <p>
                          One proximity alert near crusher feed. Review KOMTRAX geofence before night
                          shift handover.
                        </p>
                        <HButton variant="secondary" size="sm">
                          Review events
                        </HButton>
                      </HVStack>
                    ),
                  },
                ]}
              />
            </HCard>
          </HSplit>
        </HVStack>
      </HContainer>
    </main>
  )
}
