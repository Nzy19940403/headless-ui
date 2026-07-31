import * as echarts from 'echarts/core'
import { BarChart, GaugeChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout } from 'echarts/features'

const chartExtensions = [
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  LabelLayout,
  CanvasRenderer,
]

/**
 * Register the tree-shaken ECharts surface used by HChart.
 *
 * Do not cache this at the chart-package module level. In a Vite workspace,
 * HMR and multiple adapters can recreate this module while retaining (or
 * recreating) ECharts' own registry. ECharts.use is idempotent per extension,
 * so calling it at the controller boundary is safe and keeps the registry
 * attached to the actual ECharts instance being used by this module.
 */
export function ensureEchartsRegistered() {
  echarts.use(chartExtensions)
}

export { echarts }
