import { useMemo, useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HChart } from '@demo/ui-react'
import { HChart as VueHChart } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import type { ChartSeriesContract } from '@demo/ui-core'

const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const productionSeries: ChartSeriesContract[] = [
  { name: 'Haul trucks', data: [42, 48, 51, 47, 55, 40, 38] },
  { name: 'Loaders', data: [18, 20, 19, 22, 21, 16, 15] },
]

const payloadSeries: ChartSeriesContract[] = [
  { name: 'Payload (t)', data: [120, 132, 101, 134, 90, 230, 210] },
]

const pieData = [
  { name: 'Running', value: 62 },
  { name: 'Idle', value: 18 },
  { name: 'Maintenance', value: 12 },
  { name: 'Fault', value: 8 },
]

const gaugeData = [{ name: 'OEE', value: 78 }]

function formatClick(d: {
  seriesName?: string
  name?: string
  value?: unknown
}) {
  return `${d.seriesName ?? ''} ${d.name ?? ''} → ${String(d.value ?? '')}`.trim()
}

const stackStyle = { width: '100%', gap: 24, alignItems: 'stretch' as const }
const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
  width: '100%',
  minWidth: 0,
}

function ReactChartDemo() {
  const [clickInfo, setClickInfo] = useState('Click a series point…')
  const areaSeries = useMemo(() => payloadSeries, [])

  return (
    <div className="demo-stack" style={stackStyle}>
      <HChart
        type="bar"
        title="Fleet utilization (week)"
        categories={categories}
        series={productionSeries}
        legend
        height={280}
        onChartClick={d => setClickInfo(formatClick(d))}
      />
      <HChart
        type="area"
        title="Payload trend"
        categories={categories}
        series={areaSeries}
        smooth
        unit="t"
        height={260}
      />
      <div style={rowStyle}>
        <HChart type="pie" title="Asset status" data={pieData} height={280} />
        <HChart type="gauge" title="Shift OEE" data={gaugeData} unit="%" height={280} />
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Last click: {clickInfo}
      </p>
    </div>
  )
}

const VueChartDemo = defineComponent({
  name: 'VueChartDemo',
  setup() {
    const clickInfo = ref('Click a series point…')
    const onBarClick = (d: { seriesName?: string; name?: string; value?: unknown }) => {
      clickInfo.value = formatClick(d)
    }
    return () =>
      h('div', { class: 'demo-stack', style: 'width:100%;gap:24px;align-items:stretch;min-width:0' }, [
        // Same contract as React/WC: multi-series bar → bottom-left legend markers
        h(VueHChart, {
          type: 'bar',
          title: 'Fleet utilization (week)',
          categories,
          series: productionSeries,
          legend: true,
          height: 280,
          onChartClick: onBarClick,
          // Vue listener form for emit('chart-click')
          'onChart-click': onBarClick,
        }),
        h(VueHChart, {
          type: 'area',
          title: 'Payload trend',
          categories,
          series: payloadSeries,
          smooth: true,
          unit: 't',
          height: 260,
        }),
        h('div', { style: 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;width:100%;min-width:0' }, [
          h(VueHChart, { type: 'pie', title: 'Asset status', data: pieData, legend: true, height: 280 }),
          h(VueHChart, { type: 'gauge', title: 'Shift OEE', data: gaugeData, unit: '%', height: 280 }),
        ]),
        h('p', { class: 'muted', style: 'margin:0' }, `Last click: ${clickInfo.value}`),
      ])
  },
})

/** Serialize once so WC first paint already has full contract (no empty→data race). */
const wcCategories = JSON.stringify(categories)
const wcSeries = JSON.stringify(productionSeries)
const wcPayload = JSON.stringify(payloadSeries)
const wcPie = JSON.stringify(pieData)
const wcGauge = JSON.stringify(gaugeData)

const wcHtml = `
<div class="demo-stack" style="width:100%;gap:24px;align-items:stretch;min-width:0">
  <h-chart
    id="wc-chart-bar"
    type="bar"
    chart-title="Fleet utilization (week)"
    height="280"
    categories='${wcCategories}'
    series='${wcSeries}'
  ></h-chart>
  <h-chart
    id="wc-chart-area"
    type="area"
    chart-title="Payload trend"
    height="260"
    smooth
    unit="t"
    categories='${wcCategories}'
    series='${wcPayload}'
  ></h-chart>
  <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;width:100%;min-width:0">
    <h-chart
      id="wc-chart-pie"
      type="pie"
      chart-title="Asset status"
      height="280"
      data='${wcPie}'
    ></h-chart>
    <h-chart
      id="wc-chart-gauge"
      type="gauge"
      chart-title="Shift OEE"
      height="280"
      unit="%"
      data='${wcGauge}'
    ></h-chart>
  </div>
  <p class="muted" id="wc-chart-click" style="margin:0">Last click: Click a series point…</p>
</div>
`.trim()

function WebChartDemo() {
  return (
    <div
      style={{ width: '100%', minWidth: 0 }}
      ref={node => {
        mountWc(node, wcHtml, root => {
          const bar = root.querySelector('#wc-chart-bar') as HTMLElement & {
            onChartClick?: (d: { seriesName?: string; name?: string; value?: unknown }) => void
          }
          const label = root.querySelector('#wc-chart-click')
          if (bar) {
            bar.onChartClick = d => {
              if (label) label.textContent = `Last click: ${formatClick(d)}`
            }
          }
        })
      }}
    />
  )
}

export default function ChartView() {
  const definition: ViewDefinition = {
    apiKey: 'chart',
    title: 'Chart',
    description: 'ECharts shell with shared controller — line, bar, area, pie, gauge.',
    reactDemo: <ReactChartDemo />,
    vueDemo: VueChartDemo,
    webDemo: <WebChartDemo />,
  }
  return <ComponentPage {...definition} />
}
