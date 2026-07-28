import { useMemo, useState } from 'react'
import { HButton, HCard, HChart, HGrid, HSelect, HStack, HTable, HTag, HVStack, HSpacer } from '@demo/ui-react'
import type { ChartSeriesContract, TableColumnContract, TableRowData, TagTone } from '@demo/ui-core'

type PaymentStatus = 'succeeded' | 'failed' | 'pending' | 'refunded'

type Transaction = TableRowData & {
  id: string
  date: string
  customer: string
  email: string
  amount: number
  fee: number
  net: number
  status: PaymentStatus
  description: string
  paymentMethod: string
}

const statusTone: Record<PaymentStatus, TagTone> = {
  succeeded: 'success',
  failed: 'danger',
  pending: 'warning',
  refunded: 'info',
}

const columns: TableColumnContract[] = [
  { accessorKey: 'date', header: 'Date', cellType: 'datetime', minSize: 160 },
  { accessorKey: 'customer', header: 'Customer', minSize: 150 },
  { accessorKey: 'amount', header: 'Amount', cellType: 'number', align: 'right', size: 110 },
  { accessorKey: 'fee', header: 'Fee', cellType: 'number', align: 'right', size: 90 },
  { accessorKey: 'net', header: 'Net', cellType: 'number', align: 'right', size: 100 },
  { accessorKey: 'status', header: 'Status', cellType: 'tag', size: 120 },
  { accessorKey: 'description', header: 'Description', minSize: 180 },
]

function generateTransactions(): Transaction[] {
  const customers = [
    { name: 'Acme Corp', email: 'billing@acme.com' },
    { name: 'Globex Inc', email: 'ap@globex.io' },
    { name: 'Initech', email: 'payments@initech.co' },
    { name: 'Umbrella Co', email: 'finance@umbrella.com' },
    { name: 'Cyberdyne Systems', email: 'ar@cyberdyne.net' },
    { name: 'Wayne Enterprises', email: 'accounts@wayne.com' },
    { name: 'Stark Industries', email: 'billing@stark.com' },
    { name: 'Ollivander & Sons', email: 'orders@ollivander.com' },
    { name: 'Massive Dynamic', email: 'finance@massive.com' },
    { name: 'Hooli', email: 'billing@hooli.xyz' },
  ]
  const statuses: PaymentStatus[] = ['succeeded', 'succeeded', 'succeeded', 'succeeded', 'failed', 'pending', 'refunded', 'succeeded', 'succeeded', 'succeeded']
  const descriptions = [
    'Monthly subscription — Pro plan',
    'Annual license renewal',
    'Enterprise tier — Q3 invoice',
    'API usage overage (Aug)',
    'One-time consulting fee',
    'Team seats upgrade (5→12)',
    'Refund — duplicate charge',
    'Data export add-on',
    'Support retainer — Sep',
    'Integration setup fee',
  ]

  const rows: Transaction[] = []
  for (let i = 0; i < 50; i++) {
    const c = customers[i % customers.length]
    const amount = [2900, 9900, 49900, 1500, 25000, 7900, 49900, 3900, 12000, 8500][i % 10]
    const fee = Math.round(amount * 0.029 + 30)
    const d = new Date(2026, 6, 27 - Math.floor(i / 2))
    rows.push({
      id: `pi_${i}_${Math.random().toString(36).slice(2, 8)}`,
      date: d.toISOString(),
      customer: c.name,
      email: c.email,
      amount,
      fee,
      net: amount - fee,
      status: statuses[i % statuses.length],
      description: descriptions[i % descriptions.length],
      paymentMethod: 'Visa •••• 4242',
    })
  }
  return rows
}

const transactions = generateTransactions()

const volumeCategories: string[] = []
const volumeData: number[] = []
for (let i = 29; i >= 0; i--) {
  const d = new Date(2026, 6, 27 - i)
  volumeCategories.push(`${d.getMonth() + 1}/${d.getDate()}`)
  volumeData.push(Math.round(8000 + Math.random() * 15000))
}

const volumeSeries: ChartSeriesContract[] = [
  { name: 'Payment volume', data: volumeData },
]

const currency = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function metrics() {
  const total = transactions.reduce((s, r) => s + r.amount, 0)
  const succeeded = transactions.filter(r => r.status === 'succeeded').reduce((s, r) => s + r.amount, 0)
  const failed = transactions.filter(r => r.status === 'failed').length
  const pending = transactions.filter(r => r.status === 'pending').length
  return [
    { label: 'Total volume', value: currency(total), sub: 'Last 30 days', tone: 'neutral' as TagTone },
    { label: 'Successful', value: currency(succeeded), sub: `${transactions.filter(r => r.status === 'succeeded').length} payments`, tone: 'success' as TagTone },
    { label: 'Failed', value: String(failed), sub: `${((failed / transactions.length) * 100).toFixed(1)}% rate`, tone: 'danger' as TagTone },
    { label: 'Pending', value: String(pending), sub: 'Awaiting confirmation', tone: 'warning' as TagTone },
  ]
}

const dayItems = [
  { value: '30d', label: 'Last 30 days' },
  { value: '7d', label: 'Last 7 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Year to date' },
]

export default function PaymentsView() {
  const [range, setRange] = useState('30d')

  const m = useMemo(() => metrics(), [])
  const clickInfo = useState('')

  return (
    <main className="payments-shell">
      {/* Header */}
      <div className="payments-header">
        <div>
          <span className="payments-header__kicker">FINANCE</span>
          <h1 className="payments-header__title">Payments</h1>
        </div>
        <HStack gap="sm" align="center">
          <HButton variant="secondary">Export</HButton>
          <HButton>Create payment</HButton>
        </HStack>
      </div>

      {/* Range selector */}
      <HStack gap="md" align="center" className="payments-range">
        <HSelect
          label="Period"
          items={dayItems}
          value={range}
          onValueChange={d => setRange(d.value)}
        />
        <span className="payments-range__hint">
          {currency(transactions.reduce((s, r) => s + r.amount, 0))} · {transactions.length} transactions
        </span>
      </HStack>

      {/* KPI cards */}
      <HGrid columns="1 sm:2 lg:4" gap="md" aria-label="Payment metrics">
        {m.map(metric => (
          <HCard key={metric.label} className="payments-kpi">
            <span className="payments-kpi__label">{metric.label}</span>
            <strong className="payments-kpi__value">{metric.value}</strong>
            <span className="payments-kpi__sub">{metric.sub}</span>
          </HCard>
        ))}
      </HGrid>

      {/* Chart */}
      <HCard className="payments-chart-card">
        <HVStack gap="md">
          <HStack gap="md" align="center">
            <HVStack gap="2xs">
              <span className="payments-chart-card__label">Payment volume</span>
              <h2 className="payments-chart-card__title">Daily revenue</h2>
            </HVStack>
            <HSpacer />
            <HTag tone="success">+12.4% vs last period</HTag>
          </HStack>
          <HChart
            type="area"
            categories={volumeCategories}
            series={volumeSeries}
            smooth
            unit="$"
            height={280}
          />
        </HVStack>
      </HCard>

      {/* Table */}
      <HCard className="payments-table-card">
        <div className="payments-table-card__head">
          <HVStack gap="2xs">
            <span className="payments-table-card__label">Transactions</span>
            <h2>Payment activity</h2>
          </HVStack>
        </div>
        <HTable
          caption={`${transactions.length} transactions (last 30 days)`}
          columns={columns}
          data={transactions}
          enableSorting
          enablePagination
          pageSize={8}
          density="compact"
        />
      </HCard>
    </main>
  )
}
