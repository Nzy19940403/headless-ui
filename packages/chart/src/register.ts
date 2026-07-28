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

let registered = false

/** Idempotent echarts.use for tree-shaken build. */
export function ensureEchartsRegistered() {
  if (registered) return
  echarts.use([
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
  ])
  registered = true
}

export { echarts }
