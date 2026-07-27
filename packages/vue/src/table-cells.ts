import { h, type VNode } from 'vue'
import type { CellContext } from '@tanstack/vue-table'
import type { TableCellType, TableColumnAlign, TableRowData } from '@demo/ui-core'
import HTag from './HTag.vue'
import HBadge from './HBadge.vue'
import HProgress from './HProgress.vue'

const toneFromStatus = (raw: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  const v = raw.toLowerCase()
  if (['active', 'online', 'done', 'success', 'pass', 'healthy', 'low'].some(k => v.includes(k)))
    return 'success'
  if (['away', 'pending', 'warn', 'hold', 'idle', 'medium', 'high'].some(k => v.includes(k)))
    return 'warning'
  if (['offline', 'error', 'fail', 'blocked', 'critical'].some(k => v.includes(k))) return 'danger'
  if (['info', 'new', 'review'].some(k => v.includes(k))) return 'info'
  return 'neutral'
}

export function renderTableCell(
  info: CellContext<TableRowData, unknown>,
  cellType: TableCellType = 'text',
  align: TableColumnAlign = 'left',
): VNode {
  const value = info.getValue()
  const className = [
    'ui-table__cell',
    `ui-table__cell--${cellType}`,
    `ui-table__cell--align-${align}`,
  ].join(' ')

  if (value == null || value === '') {
    return h('span', { class: className }, '—')
  }

  switch (cellType) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      return h('span', { class: className }, Number.isFinite(n) ? n.toLocaleString() : String(value))
    }
    case 'tag': {
      const text = String(value)
      return h('span', { class: className }, [h(HTag, { tone: toneFromStatus(text) }, () => text)])
    }
    case 'badge': {
      const text = String(value)
      return h('span', { class: className }, [h(HBadge, { tone: toneFromStatus(text) }, () => text)])
    }
    case 'progress': {
      const n = typeof value === 'number' ? value : Number(value)
      const safe = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
      return h('span', { class: className }, [
        h('span', { class: 'ui-table__progress-wrap' }, [
          h(HProgress, { value: safe, max: 100 }),
          h('span', { class: 'ui-table__progress-label' }, `${safe}%`),
        ]),
      ])
    }
    case 'datetime': {
      const d = value instanceof Date ? value : new Date(String(value))
      const text = Number.isNaN(d.getTime())
        ? String(value)
        : d.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
      return h('span', { class: className }, text)
    }
    case 'boolean': {
      const on = value === true || value === 'true' || value === 1 || value === '1'
      return h('span', { class: className }, [
        h(HTag, { tone: on ? 'success' : 'neutral' }, () => (on ? 'Yes' : 'No')),
      ])
    }
    case 'text':
    default:
      return h('span', { class: className }, String(value))
  }
}
