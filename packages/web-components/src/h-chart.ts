import type {
  ChartClickDetails,
  ChartContract,
  ChartDatumContract,
  ChartSeriesContract,
  ChartType,
} from '@demo/ui-core'
import { createChartController, type ChartController } from '@demo/ui-chart'
import {
  asDetailHandler,
  defineOnce,
  emitDetail,
  upgradeDetailHandlerProperties,
  upgradeProperty,
  type DetailHandler,
} from './compound'

const jsonConverter = {
  fromAttribute(value: string | null) {
    if (value == null || value === '') return undefined
    try {
      return JSON.parse(value)
    } catch {
      return undefined
    }
  },
  toAttribute(value: unknown) {
    if (value === undefined) return null
    return JSON.stringify(value)
  },
}

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value == null) return fallback
  if (value === '' || value === 'true') return true
  if (value === 'false') return false
  return fallback
}

/**
 * Self-rendering chart host. Shared controller = ECharts lifecycle.
 * Props mirror ChartContract; complex fields accept JSON attributes or JS properties.
 */
export class HChart extends HTMLElement {
  static observedAttributes = [
    'type',
    'title',
    'chart-title',
    'height',
    'loading',
    'empty-text',
    'legend',
    'smooth',
    'stack',
    'unit',
    'categories',
    'series',
    'data',
  ]

  #ctl: ChartController | null = null
  #type: ChartType = 'line'
  #categories: string[] | undefined
  #series: ChartSeriesContract[] | undefined
  #data: ChartDatumContract[] | undefined
  /** Chart heading (not HTMLElement.title tooltip). */
  #chartTitle: string | undefined
  #height: number | string = 320
  #loading = false
  #emptyText = 'No data'
  #legend: boolean | undefined
  #smooth = false
  #stack = false
  #unit: string | undefined
  #onChartClick: DetailHandler<ChartClickDetails> | undefined
  #raf = 0

  connectedCallback() {
    this.classList.add('ui-chart')
    // Ensure CE participates in flex/grid sizing before ECharts measures.
    this.style.display = 'block'
    this.style.width = '100%'
    this.style.maxWidth = '100%'
    this.style.minWidth = '0'
    this.style.boxSizing = 'border-box'

    upgradeDetailHandlerProperties(this)
    upgradeProperty(this, 'categories')
    upgradeProperty(this, 'series')
    upgradeProperty(this, 'data')
    upgradeProperty(this, 'onChartClick')

    // Hydrate observed fields from attributes (upgrade order can skip early syncs).
    this.#hydrateFromAttributes()

    this.#ctl = createChartController(this)
    this.#scheduleSync()
  }

  #hydrateFromAttributes() {
    const type = this.getAttribute('type')
    if (type) this.#type = type as ChartType

    const heading = this.getAttribute('chart-title') ?? this.getAttribute('title')
    if (heading) this.#chartTitle = heading

    const height = this.getAttribute('height')
    if (height != null) {
      this.#height = /^\d+(\.\d+)?$/.test(height) ? Number(height) : height
    }

    const emptyText = this.getAttribute('empty-text')
    if (emptyText != null) this.#emptyText = emptyText

    if (this.hasAttribute('loading')) this.#loading = this.getAttribute('loading') !== 'false'
    if (this.hasAttribute('smooth')) this.#smooth = this.getAttribute('smooth') !== 'false'
    if (this.hasAttribute('stack')) this.#stack = this.getAttribute('stack') !== 'false'
    if (this.hasAttribute('legend')) {
      this.#legend = this.getAttribute('legend') !== 'false'
    }

    const unit = this.getAttribute('unit')
    if (unit != null) this.#unit = unit

    const categories = jsonConverter.fromAttribute(this.getAttribute('categories'))
    if (categories !== undefined) this.#categories = categories as string[]

    const series = jsonConverter.fromAttribute(this.getAttribute('series'))
    if (series !== undefined) this.#series = series as ChartSeriesContract[]

    const data = jsonConverter.fromAttribute(this.getAttribute('data'))
    if (data !== undefined) this.#data = data as ChartDatumContract[]
  }

  disconnectedCallback() {
    if (this.#raf) cancelAnimationFrame(this.#raf)
    this.#raf = 0
    this.#ctl?.dispose()
    this.#ctl = null
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    switch (name) {
      case 'type':
        this.#type = (value as ChartType) || 'line'
        break
      case 'title':
      case 'chart-title':
        // `title` attr doubles as chart heading; do not override HTMLElement.title property.
        this.#chartTitle = value ?? undefined
        break
      case 'height':
        this.#height = value && /^\d+(\.\d+)?$/.test(value) ? Number(value) : (value ?? 320)
        break
      case 'loading':
        this.#loading = value !== null && value !== 'false'
        break
      case 'empty-text':
        this.#emptyText = value ?? 'No data'
        break
      case 'legend':
        this.#legend = value == null ? undefined : parseBool(value, true)
        break
      case 'smooth':
        this.#smooth = parseBool(value, false)
        break
      case 'stack':
        this.#stack = parseBool(value, false)
        break
      case 'unit':
        this.#unit = value ?? undefined
        break
      case 'categories':
        this.#categories = jsonConverter.fromAttribute(value) as string[] | undefined
        break
      case 'series':
        this.#series = jsonConverter.fromAttribute(value) as ChartSeriesContract[] | undefined
        break
      case 'data':
        this.#data = jsonConverter.fromAttribute(value) as ChartDatumContract[] | undefined
        break
    }
    this.#scheduleSync()
  }

  get type() {
    return this.#type
  }
  set type(v: ChartType) {
    this.#type = v ?? 'line'
    this.#scheduleSync()
  }

  get categories() {
    return this.#categories
  }
  set categories(v: string[] | undefined) {
    this.#categories = v
    this.#scheduleSync()
  }

  get series() {
    return this.#series
  }
  set series(v: ChartSeriesContract[] | undefined) {
    this.#series = v
    this.#scheduleSync()
  }

  get data() {
    return this.#data
  }
  set data(v: ChartDatumContract[] | undefined) {
    this.#data = v
    this.#scheduleSync()
  }

  /** Chart heading (Core `title`). Prefer this over HTML tooltip `title`. */
  get chartTitle() {
    return this.#chartTitle
  }
  set chartTitle(v: string | undefined) {
    this.#chartTitle = v
    this.#scheduleSync()
  }

  get height() {
    return this.#height
  }
  set height(v: number | string) {
    this.#height = v ?? 320
    this.#scheduleSync()
  }

  get loading() {
    return this.#loading
  }
  set loading(v: boolean) {
    this.#loading = Boolean(v)
    this.#scheduleSync()
  }

  get emptyText() {
    return this.#emptyText
  }
  set emptyText(v: string) {
    this.#emptyText = v ?? 'No data'
    this.#scheduleSync()
  }

  get legend() {
    return this.#legend
  }
  set legend(v: boolean | undefined) {
    this.#legend = v
    this.#scheduleSync()
  }

  get smooth() {
    return this.#smooth
  }
  set smooth(v: boolean) {
    this.#smooth = Boolean(v)
    this.#scheduleSync()
  }

  get stack() {
    return this.#stack
  }
  set stack(v: boolean) {
    this.#stack = Boolean(v)
    this.#scheduleSync()
  }

  get unit() {
    return this.#unit
  }
  set unit(v: string | undefined) {
    this.#unit = v
    this.#scheduleSync()
  }

  get onChartClick() {
    return this.#onChartClick
  }
  set onChartClick(v: unknown) {
    this.#onChartClick = asDetailHandler<ChartClickDetails>(v)
  }

  #scheduleSync() {
    if (!this.isConnected) return
    if (this.#raf) cancelAnimationFrame(this.#raf)
    this.#raf = requestAnimationFrame(() => {
      this.#raf = 0
      this.#sync()
    })
  }

  #sync() {
    if (!this.#ctl) return
    const contract: ChartContract = {
      type: this.#type,
      categories: this.#categories,
      series: this.#series,
      data: this.#data,
      title: this.#chartTitle,
      height: this.#height,
      loading: this.#loading,
      emptyText: this.#emptyText,
      legend: this.#legend,
      smooth: this.#smooth,
      stack: this.#stack,
      unit: this.#unit,
      onChartClick: details => {
        emitDetail(this, 'chart-click', details, this.#onChartClick)
      },
    }
    this.#ctl.update(contract)
  }
}

export type HChartProps = ChartContract
defineOnce('h-chart', HChart)
