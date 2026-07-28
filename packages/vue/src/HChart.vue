<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import type {
  ChartClickDetails,
  ChartDatumContract,
  ChartSeriesContract,
  ChartType,
} from '@demo/ui-core'
import {
  createChartController,
  type ChartController,
  type ChartControllerInput,
} from '@demo/ui-chart'
import type { EChartsCoreOption } from 'echarts/core'

/**
 * Explicit runtime props (not only imported interface).
 * Imported `defineProps<ChartContract>()` can fail to expose array fields
 * like `series` / `categories` at runtime in some SFC builds — they then
 * fall through as attrs and the chart never sees multi-series → no legend.
 */
const props = withDefaults(
  defineProps<{
    type?: ChartType
    categories?: string[]
    series?: ChartSeriesContract[]
    data?: ChartDatumContract[]
    title?: string
    height?: number | string
    loading?: boolean
    emptyText?: string
    legend?: boolean
    smooth?: boolean
    stack?: boolean
    unit?: string
    /** React-style callback; also emitted as chart-click */
    onChartClick?: (details: ChartClickDetails) => void
    option?: EChartsCoreOption
    notMerge?: boolean
    class?: string
  }>(),
  {
    type: 'line',
    height: 320,
    loading: false,
    emptyText: 'No data',
    smooth: false,
    stack: false,
  },
)

const emit = defineEmits<{
  'chart-click': [details: ChartClickDetails]
  chartClick: [details: ChartClickDetails]
}>()

const attrs = useAttrs()
const hostRef = ref<HTMLDivElement | null>(null)
let ctl: ChartController | null = null

function fromAttrs<T>(key: string): T | undefined {
  const v = attrs[key]
  return v as T | undefined
}

function pushUpdate() {
  if (!ctl) return

  // Prefer declared props; fall back to attrs if a field was not declared as prop.
  const series = props.series ?? fromAttrs<ChartSeriesContract[]>('series')
  const categories = props.categories ?? fromAttrs<string[]>('categories')
  const data = props.data ?? fromAttrs<ChartDatumContract[]>('data')

  const input: ChartControllerInput = {
    type: props.type,
    categories,
    series,
    data,
    title: props.title,
    height: props.height,
    loading: props.loading,
    emptyText: props.emptyText,
    // Default: show legend when multi-series (preset also decides).
    legend: props.legend,
    smooth: props.smooth,
    stack: props.stack,
    unit: props.unit,
    option: props.option,
    notMerge: props.notMerge,
    onChartClick: details => {
      props.onChartClick?.(details)
      emit('chart-click', details)
      emit('chartClick', details)
    },
  }
  ctl.update(input)
}

onMounted(() => {
  if (!hostRef.value) return
  ctl = createChartController(hostRef.value)
  // Wait a frame so flex/grid parents have width (same CE layout issue).
  nextTick(() => {
    pushUpdate()
    requestAnimationFrame(() => pushUpdate())
  })
})

onBeforeUnmount(() => {
  ctl?.dispose()
  ctl = null
})

watch(
  () =>
    [
      props.type,
      props.categories,
      props.series,
      props.data,
      props.title,
      props.height,
      props.loading,
      props.emptyText,
      props.legend,
      props.smooth,
      props.stack,
      props.unit,
      props.option,
      props.notMerge,
      attrs.series,
      attrs.categories,
      attrs.data,
    ] as const,
  () => pushUpdate(),
  { deep: true },
)
</script>

<template>
  <div
    ref="hostRef"
    class="ui-chart"
    :class="props.class"
    style="width: 100%; max-width: 100%; min-width: 0"
  />
</template>
