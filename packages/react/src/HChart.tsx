import { useEffect, useRef } from 'react'
import type { ChartContract } from '@demo/ui-core'
import {
  createChartController,
  type ChartController,
  type ChartControllerInput,
} from '@demo/ui-chart'
import type { EChartsCoreOption } from 'echarts/core'

export interface HChartProps extends ChartContract {
  className?: string
  /**
   * React escape hatch: full ECharts option.
   * When set, replaces Core preset option.
   */
  option?: EChartsCoreOption
  /** setOption notMerge. Default true. */
  notMerge?: boolean
}

/**
 * Shell over shared `@demo/ui-chart` controller (ECharts).
 * Preset path: type + series/data. Advanced: `option`.
 */
export function HChart({
  type = 'line',
  categories,
  series,
  data,
  title,
  height = 320,
  loading = false,
  emptyText = 'No data',
  legend,
  smooth = false,
  stack = false,
  unit,
  onChartClick,
  option,
  notMerge,
  className,
}: HChartProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const ctlRef = useRef<ChartController | null>(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    ctlRef.current = createChartController(el)
    return () => {
      ctlRef.current?.dispose()
      ctlRef.current = null
    }
  }, [])

  useEffect(() => {
    const input: ChartControllerInput = {
      type,
      categories,
      series,
      data,
      title,
      height,
      loading,
      emptyText,
      legend,
      smooth,
      stack,
      unit,
      onChartClick,
      option,
      notMerge,
    }
    ctlRef.current?.update(input)
  }, [
    type,
    categories,
    series,
    data,
    title,
    height,
    loading,
    emptyText,
    legend,
    smooth,
    stack,
    unit,
    onChartClick,
    option,
    notMerge,
  ])

  return (
    <div
      ref={hostRef}
      className={['ui-chart', className].filter(Boolean).join(' ')}
    />
  )
}
