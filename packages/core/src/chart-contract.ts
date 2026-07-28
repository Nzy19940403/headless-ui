/**
 * HChart public contract (ECharts under the hood).
 *
 * Core stays framework-agnostic and serializable enough for WC attributes:
 * - type + categories + series (cartesian) or data (pie / gauge)
 * - presentation flags (legend, smooth, stack, unit, loading)
 *
 * Full ECharts `option` remains a React/Vue escape hatch via HChartProps,
 * not this Core contract.
 */

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'gauge' | 'scatter'

export interface ChartSeriesContract {
  /** Legend / series label. */
  name: string
  /** Numeric points; null = gap. */
  data: Array<number | null>
  /** Override chart-level type (mixed charts). */
  type?: ChartType
}

/** Pie / gauge style name-value pairs. */
export interface ChartDatumContract {
  name: string
  value: number
}

export interface ChartClickDetails {
  name?: string
  value?: number | string | Array<unknown>
  seriesName?: string
  dataIndex?: number
  seriesIndex?: number
}

export type ChartClickHandler = (details: ChartClickDetails) => void

export interface ChartContract {
  /** Default series geometry. Default `'line'`. */
  type?: ChartType

  /** Category axis labels (cartesian) or unused for pure pie when using `data`. */
  categories?: string[]

  /** Multi-series cartesian data. */
  series?: ChartSeriesContract[]

  /**
   * Pie / gauge shorthand (or single-series named values).
   * When set with type pie/gauge, preferred over `series`.
   */
  data?: ChartDatumContract[]

  title?: string
  /** CSS height; number → px. Default 320. */
  height?: number | string
  loading?: boolean
  emptyText?: string

  /** Show legend. Default true when more than one series or pie slices. */
  legend?: boolean
  /** Smooth line/area. Default false. */
  smooth?: boolean
  /** Stack cartesian series. Default false. */
  stack?: boolean
  /** Y-axis unit suffix (cartesian). */
  unit?: string

  onChartClick?: ChartClickHandler
}
