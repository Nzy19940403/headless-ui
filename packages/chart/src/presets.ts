import type {
  ChartContract,
  ChartDatumContract,
  ChartSeriesContract,
  ChartType,
} from '@demo/ui-core'
import type { EChartsCoreOption } from 'echarts/core'
import { readUiChartTheme, type UiChartThemeTokens } from './theme'

export function isChartEmpty(input: ChartContract): boolean {
  const type = input.type ?? 'line'
  if (type === 'pie' || type === 'gauge') {
    if (input.data && input.data.length > 0) return false
    if (input.series?.some(s => s.data.some(v => v != null))) return false
    return true
  }
  if (input.series?.some(s => s.data.length > 0)) return false
  if (input.data && input.data.length > 0) return false
  return true
}

function seriesType(type: ChartType | undefined, fallback: ChartType): ChartType {
  return type ?? fallback
}

function echartsSeriesType(type: ChartType): 'line' | 'bar' | 'scatter' | 'pie' | 'gauge' {
  if (type === 'area') return 'line'
  return type
}

function shouldShowLegend(input: ChartContract): boolean {
  if (input.legend === false) return false
  if (input.legend === true) return true
  const type = input.type ?? 'line'
  if (type === 'pie') return (input.data?.length ?? 0) > 1 || (input.series?.length ?? 0) > 0
  if (type === 'gauge') return false
  return (input.series?.length ?? 0) > 1
}

function pieData(input: ChartContract): ChartDatumContract[] {
  if (input.data?.length) return input.data
  const first = input.series?.[0]
  if (!first) return []
  const cats = input.categories ?? []
  return first.data.map((value, i) => ({
    name: cats[i] ?? `${first.name} ${i + 1}`,
    value: value ?? 0,
  }))
}

function cartesianSeries(input: ChartContract, theme: UiChartThemeTokens) {
  const baseType = input.type ?? 'line'
  const list: ChartSeriesContract[] =
    input.series?.length
      ? input.series
      : input.data?.length
        ? [
            {
              name: input.title || 'Series',
              data: input.data.map(d => d.value),
            },
          ]
        : []

  return list.map((s, index) => {
    const t = seriesType(s.type, baseType)
    const ecType = echartsSeriesType(t)
    const item: Record<string, unknown> = {
      name: s.name,
      type: ecType,
      data: s.data,
      smooth: input.smooth ?? false,
      showSymbol: t === 'scatter' ? true : (s.data.length <= 24),
      emphasis: { focus: 'series' },
      itemStyle: { color: theme.color[index % theme.color.length] },
    }
    if (input.stack) item.stack = 'total'
    if (t === 'area') {
      item.areaStyle = { opacity: 0.18 }
    }
    if (t === 'scatter') {
      item.symbolSize = 10
    }
    return item
  })
}

function emptyOption(input: ChartContract, theme: UiChartThemeTokens): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    title: input.title
      ? {
          text: input.title,
          left: 'center',
          top: 8,
          textStyle: { color: theme.text, fontSize: 14, fontWeight: 600 },
        }
      : undefined,
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: input.emptyText ?? 'No data',
          fill: theme.muted,
          fontSize: 14,
        },
      },
    ],
  }
}

function baseText(theme: UiChartThemeTokens) {
  return {
    color: theme.text,
    fontFamily: 'inherit',
  }
}

/** Build a tree-shaken-friendly ECharts option from ChartContract. */
export function buildOptionFromContract(
  input: ChartContract,
  host?: Element,
): EChartsCoreOption {
  const theme = readUiChartTheme(host)
  if (isChartEmpty(input)) return emptyOption(input, theme)

  const type = input.type ?? 'line'
  const showLegend = shouldShowLegend(input)

  if (type === 'pie') {
    return {
      backgroundColor: 'transparent',
      color: theme.color,
      title: input.title
        ? {
            text: input.title,
            left: 'center',
            top: 8,
            textStyle: { ...baseText(theme), fontSize: 14, fontWeight: 600 },
          }
        : undefined,
      tooltip: { trigger: 'item' },
      legend: showLegend
        ? {
            bottom: 0,
            textStyle: { color: theme.textSecondary },
          }
        : undefined,
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', showLegend ? '46%' : '52%'],
          data: pieData(input),
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.15)' },
          },
          label: { color: theme.textSecondary },
        },
      ],
    }
  }

  if (type === 'gauge') {
    const value =
      input.data?.[0]?.value ??
      input.series?.[0]?.data?.find(v => v != null) ??
      0
    const name = input.data?.[0]?.name ?? input.series?.[0]?.name ?? ''
    const unit = input.unit ?? ''
    return {
      backgroundColor: 'transparent',
      title: input.title
        ? {
            text: input.title,
            left: 'center',
            top: 4,
            textStyle: { ...baseText(theme), fontSize: 13, fontWeight: 600 },
          }
        : undefined,
      series: [
        {
          type: 'gauge',
          // Dashboard-style arc (not full car speedometer).
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: '88%',
          center: ['50%', input.title ? '58%' : '55%'],
          progress: {
            show: true,
            width: 10,
            roundCap: true,
            itemStyle: { color: theme.primary },
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 10,
              color: [[1, theme.hairline]],
            },
          },
          axisTick: { show: false },
          splitLine: {
            length: 6,
            distance: 2,
            lineStyle: { width: 1.5, color: theme.muted },
          },
          // Tick labels (0 / 20 / … / 100) — keep small so dial is readable in cards.
          axisLabel: {
            color: theme.muted,
            distance: 12,
            fontSize: 10,
            formatter: (v: number) => (unit && (v === 0 || v === 100) ? `${v}${unit}` : String(v)),
          },
          pointer: {
            show: true,
            length: '52%',
            width: 3,
            itemStyle: { color: theme.primary },
          },
          anchor: {
            show: true,
            size: 6,
            itemStyle: { color: theme.primary, borderWidth: 0 },
          },
          // Series "title" is the datum name under the value — keep subtle.
          title: {
            show: Boolean(name),
            offsetCenter: [0, '72%'],
            color: theme.textSecondary,
            fontSize: 11,
            fontWeight: 500,
          },
          // Center reading — main number, but not oversized for ~280px panels.
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '40%'],
            formatter: unit ? `{value}${unit}` : '{value}',
            color: theme.text,
            fontSize: 22,
            fontWeight: 650,
            lineHeight: 24,
          },
          data: [{ value: Number(value), name }],
        },
      ],
    }
  }

  // cartesian: line | area | bar | scatter
  const categories =
    input.categories ??
    input.data?.map(d => d.name) ??
    []

  return {
    backgroundColor: 'transparent',
    color: theme.color,
    title: input.title
      ? {
          text: input.title,
          left: 'left',
          top: 0,
          textStyle: { ...baseText(theme), fontSize: 14, fontWeight: 600 },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: type === 'bar' ? 'shadow' : 'line' },
    },
    // Multi-series: legend as color markers (Haul trucks / Loaders, etc.)
    // Bottom-left keeps title clear and matches dashboard reading order.
    legend: showLegend
      ? {
          left: 0,
          bottom: 0,
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          icon: 'roundRect',
          textStyle: { color: theme.textSecondary, fontSize: 11 },
        }
      : undefined,
    grid: {
      left: 12,
      right: 16,
      top: input.title ? 36 : 24,
      bottom: showLegend ? 40 : 8,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: type === 'bar',
      axisLine: { lineStyle: { color: theme.hairline } },
      axisTick: { show: false },
      axisLabel: { color: theme.muted },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: theme.hairline, type: 'dashed' } },
      axisLabel: {
        color: theme.muted,
        formatter: input.unit ? `{value}${input.unit}` : '{value}',
      },
    },
    series: cartesianSeries(input, theme),
  }
}
