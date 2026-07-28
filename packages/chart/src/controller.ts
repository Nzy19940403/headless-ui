import type { ChartClickDetails, ChartContract } from '@demo/ui-core'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import { ensureEchartsRegistered, echarts } from './register'
import { buildOptionFromContract, isChartEmpty } from './presets'

export type ChartControllerInput = ChartContract & {
  /**
   * Escape hatch: full ECharts option.
   * When set, replaces preset-built option (theme colors still applied as base when mergeTheme).
   */
  option?: EChartsCoreOption
  /** Passed to setOption. Default true for predictable preset updates. */
  notMerge?: boolean
}

export interface ChartController {
  update: (input: ChartControllerInput) => void
  dispose: () => void
  getInstance: () => EChartsType | null
  resize: () => void
}

function resolveHeight(height?: number | string): string {
  if (height == null || height === '') return '320px'
  if (typeof height === 'number' && Number.isFinite(height)) return `${height}px`
  return String(height)
}

function toClickDetails(params: {
  name?: string
  value?: unknown
  seriesName?: string
  dataIndex?: number
  seriesIndex?: number
}): ChartClickDetails {
  const value = params.value
  return {
    name: params.name,
    value: value as ChartClickDetails['value'],
    seriesName: params.seriesName,
    dataIndex: params.dataIndex,
    seriesIndex: params.seriesIndex,
  }
}

/**
 * Framework-agnostic ECharts lifecycle.
 * React / Vue / WC only mount a host element and call update/dispose.
 *
 * Chart is always inited on an inner viewport div so custom elements / flex
 * layouts get a reliable box (host width 100%, min-width 0).
 */
export function createChartController(host: HTMLElement): ChartController {
  ensureEchartsRegistered()

  let chart: EChartsType | null = null
  let viewport: HTMLDivElement | null = null
  let ro: ResizeObserver | null = null
  let clickHandler: ((details: ChartClickDetails) => void) | undefined
  let resizeRaf = 0
  let layoutRetries = 0
  let disposed = false

  const applyHostBox = (height?: number | string) => {
    host.classList.add('ui-chart')
    host.style.display = 'block'
    host.style.width = '100%'
    host.style.maxWidth = '100%'
    host.style.minWidth = '0'
    host.style.height = resolveHeight(height)
    host.style.position = 'relative'
    host.style.boxSizing = 'border-box'
  }

  const ensureViewport = () => {
    if (viewport && viewport.isConnected) return viewport
    viewport = host.querySelector<HTMLDivElement>(':scope > .ui-chart__viewport')
    if (!viewport) {
      viewport = document.createElement('div')
      viewport.className = 'ui-chart__viewport'
      host.append(viewport)
    }
    viewport.style.cssText =
      'display:block;width:100%;height:100%;min-width:0;min-height:0;position:relative;'
    return viewport
  }

  const scheduleResize = () => {
    if (disposed) return
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      if (!chart || disposed) return
      chart.resize()
      requestAnimationFrame(() => {
        if (!disposed) chart?.resize()
      })
    })
  }

  const ensureChart = () => {
    if (chart) return chart
    const el = ensureViewport()
    const w = el.clientWidth || host.clientWidth || undefined
    const h = el.clientHeight || host.clientHeight || undefined
    chart = echarts.init(el, undefined, {
      renderer: 'canvas',
      width: w && w > 0 ? w : undefined,
      height: h && h > 0 ? h : undefined,
    })
    chart.on('click', (params: unknown) => {
      if (!clickHandler) return
      clickHandler(toClickDetails(params as Parameters<typeof toClickDetails>[0]))
    })
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => scheduleResize())
      ro.observe(host)
      ro.observe(el)
    }
    return chart
  }

  const update = (input: ChartControllerInput) => {
    if (disposed || !host.isConnected) return

    applyHostBox(input.height)
    if (input.loading) host.dataset.loading = ''
    else delete host.dataset.loading
    if (input.title) host.setAttribute('aria-label', input.title)
    else host.removeAttribute('aria-label')
    host.setAttribute('role', 'img')

    clickHandler = input.onChartClick

    // CE + grid often report 0 width on first connected frame; wait for layout.
    const width = host.clientWidth
    if (width <= 0 && layoutRetries < 12) {
      layoutRetries += 1
      requestAnimationFrame(() => update(input))
      return
    }
    layoutRetries = 0

    const instance = ensureChart()

    if (input.loading) {
      instance.showLoading('default', {
        text: '',
        maskColor: 'rgba(255,255,255,0.35)',
      })
    } else {
      instance.hideLoading()
    }

    if (input.loading && isChartEmpty(input) && !input.option) {
      return
    }

    const option =
      input.option ??
      buildOptionFromContract(
        {
          type: input.type,
          categories: input.categories,
          series: input.series,
          data: input.data,
          title: input.title,
          emptyText: input.emptyText,
          legend: input.legend,
          smooth: input.smooth,
          stack: input.stack,
          unit: input.unit,
        },
        host,
      )

    // Full replace so preset style upgrades (e.g. gauge) never leave stale series.
    instance.clear()
    instance.setOption(option, { notMerge: true, lazyUpdate: false })
    scheduleResize()
  }

  const dispose = () => {
    disposed = true
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    resizeRaf = 0
    ro?.disconnect()
    ro = null
    clickHandler = undefined
    chart?.dispose()
    chart = null
    viewport?.remove()
    viewport = null
  }

  return {
    update,
    dispose,
    getInstance: () => chart,
    resize: () => scheduleResize(),
  }
}
