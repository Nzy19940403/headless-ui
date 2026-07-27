import type { CellContext } from '@tanstack/react-table'
import type { TableCellType, TableColumnAlign, TableRowData } from '@demo/ui-core'
import { HTag } from './HTag'
import { HBadge } from './HBadge'
import { HProgress } from './HProgress'

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
) {
  const value = info.getValue()
  const className = [
    'ui-table__cell',
    `ui-table__cell--${cellType}`,
    `ui-table__cell--align-${align}`,
  ].join(' ')

  if (value == null || value === '') {
    return <span className={className}>—</span>
  }

  switch (cellType) {
    case 'number': {
      const n = typeof value === 'number' ? value : Number(value)
      return (
        <span className={className}>
          {Number.isFinite(n) ? n.toLocaleString() : String(value)}
        </span>
      )
    }
    case 'tag': {
      const text = String(value)
      return (
        <span className={className}>
          <HTag tone={toneFromStatus(text)}>{text}</HTag>
        </span>
      )
    }
    case 'badge': {
      const text = String(value)
      return (
        <span className={className}>
          <HBadge tone={toneFromStatus(text)}>{text}</HBadge>
        </span>
      )
    }
    case 'progress': {
      const n = typeof value === 'number' ? value : Number(value)
      const safe = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
      return (
        <span className={className}>
          <span className="ui-table__progress-wrap">
            <HProgress value={safe} max={100} />
            <span className="ui-table__progress-label">{safe}%</span>
          </span>
        </span>
      )
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
      return <span className={className}>{text}</span>
    }
    case 'boolean': {
      const on = value === true || value === 'true' || value === 1 || value === '1'
      return (
        <span className={className}>
          <HTag tone={on ? 'success' : 'neutral'}>{on ? 'Yes' : 'No'}</HTag>
        </span>
      )
    }
    case 'text':
    default:
      return <span className={className}>{String(value)}</span>
  }
}
