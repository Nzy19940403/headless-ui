# Chart (`HChart`)

Core: `packages/core/src/chart-contract.ts`  
Engine: `packages/chart` (`@demo/ui-chart`) — Apache ECharts, tree-shaken `echarts/core`.

Shared **controller** owns init / setOption / resize / dispose. React, Vue, and Web Component shells only mount a host element.

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `type` | `'line' \| 'bar' \| 'pie' \| 'area' \| 'gauge' \| 'scatter'` | `'line'` |
| `categories` | `string[]` | - |
| `series` | `{ name; data; type? }[]` | - |
| `data` | `{ name; value }[]` | pie / gauge shorthand |
| `title` | `string` | - |
| `height` | `number \| string` | `320` |
| `loading` | `boolean` | `false` |
| `emptyText` | `string` | `'No data'` |
| `legend` | `boolean` | auto (multi-series / pie) |
| `smooth` | `boolean` | `false` |
| `stack` | `boolean` | `false` |
| `unit` | `string` | Y-axis unit suffix |
| `option` | ECharts option | React/Vue only escape hatch |

## Events

| Event | Payload |
| --- | --- |
| `chart-click` | `{ name?, value?, seriesName?, dataIndex?, seriesIndex? }` |

| Stack | Handler |
| --- | --- |
| React | `onChartClick` |
| Vue | `@chart-click` / `onChartClick` |
| WC | `onChartClick` property + `chart-click` CustomEvent |

## Architecture

```text
ChartContract (core)
  → buildOptionFromContract + createChartController (@demo/ui-chart)
  → HChart / HChart.vue / h-chart (thin hosts)
```

Theme colors are read from `--ui-color-*` on each update so `data-theme` switches stay aligned.

## Web Component notes

Complex props accept JSON attributes or JS properties:

```html
<h-chart
  type="bar"
  title="Load"
  categories='["Mon","Tue","Wed"]'
  series='[{"name":"A","data":[1,2,3]}]'
></h-chart>
```
