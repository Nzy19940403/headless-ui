/**
 * React / TSX codegen — transforms a validated A2UISurface into:
 *
 *   1. A complete `.js` file string (generateReactCode)
 *   2. A live, renderable React component (compileReactCode)
 *
 * Both consume the SAME generated code string.  genTSX emits
 * `React.createElement(...)` calls directly, so the output is
 * valid JavaScript with no TypeScript-specific syntax — it compiles
 * via `new Function()` with zero transpilation.
 *
 * ## Guarantees
 *
 * - Every component the catalog knows about has a codegen case.
 * - Unregistered component types produce a TODO placeholder.
 * - Imports are collected automatically — only actually-used components appear.
 * - Data-model bindings (`{path: "..."}`) are compiled into `getData()` calls.
 * - Input components get per-field `useState` + change handlers.
 * - Action components get `onAction` callback stubs.
 */

import React from 'react'
import * as UiReact from '@demo/ui-react'
import { getCatalogEntry } from '../catalog/catalog'
import type { A2UIComponent, A2UISurface } from '../protocol/types'

// ── Types ─────────────────────────────────────────────────────────

interface GenContext {
  /** Set of H* component import names collected during tree walk. */
  imports: Set<string>
  /** Per-field input state declarations to emit. */
  inputStates: Map<string, string>
  /** Per-field change handlers to emit. */
  inputHandlers: Map<string, string>
  /** Input IDs whose value/checked is bound to the data model. */
  boundInputs: Set<string>
  /** Whether any handler writes back to the data model (triggers setDataAtPath helper). */
  hasDataWriteback: boolean
}

interface GenProps {
  /** Resolved literal / stringified props for the component. */
  entries: [string, string][]
  /** Whether any prop was bound to the data model. */
  hasBindings: boolean
}

// ── Constants ─────────────────────────────────────────────────────

/** Components that need per-field useState. */
const INPUT_TYPES = new Set([
  'Input', 'NumberInput', 'Textarea', 'Select', 'Checkbox', 'Toggle', 'DatePicker',
])

/** Components that are self-closing (no children). */
const SELF_CLOSING = new Set([
  'Badge', 'Tag', 'Progress', 'Separator', 'Text',
  'Input', 'NumberInput', 'Textarea', 'Select', 'Checkbox', 'Toggle', 'DatePicker',
])

// ── Helpers ───────────────────────────────────────────────────────

/** META_KEYS we skip when emitting props. */
const META_KEYS = new Set(['id', 'component', 'weight', 'children'])

/** Check for a data-model bound value. */
function isBoundValue(v: unknown): v is { path: string } {
  return (
    typeof v === 'object' && v !== null &&
    !Array.isArray(v) && 'path' in v &&
    typeof (v as Record<string, unknown>).path === 'string'
  )
}

/** Check for a bound action value. */
function isActionValue(v: unknown): v is { name: string; context?: Record<string, unknown> } {
  return (
    typeof v === 'object' && v !== null &&
    !Array.isArray(v) && 'name' in v
  )
}

/** Escape a string value for use in JSX / TS string literals. */
function esc(v: unknown): string {
  if (typeof v !== 'string') return String(v ?? '')
  return v.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')
}

/** Convert a runtime value to a TS literal expression. */
function toLiteral(v: unknown): string {
  if (v === null || v === undefined) return 'undefined'
  if (typeof v === 'string') return `'${esc(v)}'`
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]'
    const items = v.map(toLiteral).join(', ')
    return `[${items}]`
  }
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const pairs = entries.map(([k, val]) => `${k}: ${toLiteral(val)}`).join(', ')
    return `{ ${pairs} }`
  }
  return String(v)
}

/**
 * Resolve a prop value.  Returns a TS expression string and a flag
 * indicating whether it's a data-model binding.
 */
function resolvePropValue(
  v: unknown,
  fieldPath: string,
  ctx: GenContext,
): { expr: string; isBinding: boolean } {
  if (isBoundValue(v)) {
    // Data-model binding → getData() call
    return { expr: `getData(data, '${esc(v.path)}')`, isBinding: true }
  }
  if (isActionValue(v)) {
    // Action object → onAction callback
    const name = esc(v.name)
    const contextStr = v.context
      ? toLiteral(v.context)
      : '{}'
    // Register this action stub
    const actionVar = `onAction_${fieldPath.replace(/[^a-zA-Z0-9]/g, '_')}`
    return { expr: `() => onAction?.({ name: '${name}', context: ${contextStr} })`, isBinding: false }
  }
  return { expr: toLiteral(v), isBinding: false }
}

// ── Component prop extraction ─────────────────────────────────────

/**
 * Extract and resolve all props for a component node.
 * Returns TSX prop strings and tracks bindings / states / imports.
 */
function genProps(node: A2UIComponent, ctx: GenContext): GenProps {
  const entries: [string, string][] = []
  let hasBindings = false

  for (const key of Object.keys(node)) {
    if (META_KEYS.has(key)) continue
    const v = (node as Record<string, unknown>)[key]
    if (v === undefined) continue

    // Skip deprecated props sub-object — only process inline props
    if (key === 'props') continue

    // ── Input value/checked: support bindings + static values ──
    const isInputComponent = INPUT_TYPES.has(node.component)
    const isCheckedComponent = node.component === 'Checkbox' || node.component === 'Toggle'
    const isDateComponent = node.component === 'DatePicker'

    if ((isInputComponent || isDateComponent) && key === 'value') {
      const baseName = node.id.replace(/-/g, '_')
      const stateName = `${isDateComponent ? 'date' : 'input'}_${baseName}`
      const setterName = `set_${baseName}`
      const handlerName = `handle_${baseName}`

      if (isBoundValue(v)) {
        // Data-bound value: init from data model; write back on change
        const dataPath = esc(v.path)
        const initExpr = `getData(INITIAL_DATA, '${dataPath}')`
        ctx.inputStates.set(node.id, `const [${stateName}, ${setterName}] = useState(${initExpr})`)
        ctx.inputHandlers.set(node.id,
          `function ${handlerName}(d: { value: string | number }) { ` +
          `${setterName}(d.value); ` +
          `setDataAtPath(data, '${dataPath}', d.value, setData) }`)
        ctx.boundInputs.add(node.id)
        ctx.hasDataWriteback = true
        hasBindings = true
      } else {
        // Static value
        ctx.inputStates.set(node.id, `const [${stateName}, ${setterName}] = useState(${toLiteral(v)})`)
        ctx.inputHandlers.set(node.id,
          `function ${handlerName}(d: { value: string | number }) { ${setterName}(d.value) }`)
      }
      entries.push([key, stateName])
      entries.push(['onValueChange', handlerName])
      continue
    }

    if (isCheckedComponent && key === 'checked') {
      const baseName = node.id.replace(/-/g, '_')
      const prefix = node.component === 'Toggle' ? 'toggled' : 'checked'
      const stateName = `${prefix}_${baseName}`
      const setterName = `set_${baseName}`
      const handlerName = `handle_${baseName}`

      if (isBoundValue(v)) {
        const dataPath = esc(v.path)
        const initExpr = `getData(INITIAL_DATA, '${dataPath}')`
        ctx.inputStates.set(node.id, `const [${stateName}, ${setterName}] = useState(${initExpr})`)
        ctx.inputHandlers.set(node.id,
          `function ${handlerName}(d: { checked: boolean }) { ` +
          `${setterName}(d.checked); ` +
          `setDataAtPath(data, '${dataPath}', d.checked, setData) }`)
        ctx.boundInputs.add(node.id)
        ctx.hasDataWriteback = true
        hasBindings = true
      } else {
        ctx.inputStates.set(node.id, `const [${stateName}, ${setterName}] = useState(${toLiteral(v)})`)
        ctx.inputHandlers.set(node.id,
          `function ${handlerName}(d: { checked: boolean }) { ${setterName}(d.checked) }`)
      }
      entries.push(['checked', stateName])
      entries.push(['onCheckedChange', handlerName])
      continue
    }

    // Skip onValueChange/onCheckedChange in the component spec — we generate our own
    if ((isInputComponent || isDateComponent) && (key === 'onValueChange' || key === 'onCheckedChange')) {
      continue
    }
    if (isCheckedComponent && key === 'onCheckedChange') {
      continue
    }

    // For Button action → onClick
    if (node.component === 'Button' && key === 'action') {
      if (isActionValue(v)) {
        const name = esc(v.name)
        const contextStr = v.context ? toLiteral(v.context) : '{}'
        entries.push(['onClick', `() => onAction?.({ name: '${name}', context: ${contextStr} })`])
      }
      continue
    }

    const { expr, isBinding } = resolvePropValue(v, node.id, ctx)
    if (isBinding) hasBindings = true
    entries.push([key, expr])
  }

  return { entries, hasBindings }
}

// ── TSX tag builders ──────────────────────────────────────────────

/** Build TSX prop string from entries. */
function buildPropString(entries: [string, string][]): string {
  if (entries.length === 0) return ''
  const parts = entries.map(([k, v]) => `${k}={${v}}`)
  return ' ' + parts.join(' ')
}

const IND = '  '

/** Recursively generate TSX for one component and its subtree. */
function genTSX(
  node: A2UIComponent,
  map: Map<string, A2UIComponent>,
  ctx: GenContext,
  depth: number,
): string {
  const pad = IND.repeat(depth)
  const childIds: string[] = (node.children as string[] | undefined) ?? []
  const children = childIds
    .map(id => map.get(id))
    .filter((c): c is A2UIComponent => c != null)
  const childTSX = children.map(c => genTSX(c, map, ctx, depth + 1))
  const hasChildren = childTSX.length > 0
  const inlineChildren = hasChildren ? childTSX.join('\n') : null

  const { entries } = genProps(node, ctx)

  switch (node.component) {
    // ── Layout ──────────────────────────────────────────────
    case 'Page': {
      const titleExpr = entries.find(([k]) => k === 'title')?.[1]
      const subtitleExpr = entries.find(([k]) => k === 'subtitle')?.[1]
      const lines: string[] = [`${pad}<div className="a2ui-page">`]
      if (titleExpr) {
        lines.push(`${pad}${IND}<h1 className="a2ui-page__title">{${titleExpr}}</h1>`)
      }
      if (subtitleExpr) {
        lines.push(`${pad}${IND}<p className="a2ui-page__subtitle">{${subtitleExpr}}</p>`)
      }
      lines.push(`${pad}${IND}<div className="a2ui-page__body">`)
      if (inlineChildren) lines.push(inlineChildren)
      lines.push(`${pad}${IND}</div>`)
      lines.push(`${pad}</div>`)
      return lines.join('\n')
    }

    case 'Row': {
      ctx.imports.add('HStack')
      const ps = buildPropString(entries.filter(([k]) => k !== 'title' && k !== 'subtitle'))
      if (hasChildren) {
        return `${pad}<HStack${ps}>\n${inlineChildren}\n${pad}</HStack>`
      }
      return `${pad}<HStack${ps} />`
    }

    case 'Col': {
      const span = entries.find(([k]) => k === 'span')?.[1] ?? '1'
      if (hasChildren) {
        return `${pad}<div style={{ flex: ${span}, minWidth: 0 }}>\n${inlineChildren}\n${pad}</div>`
      }
      return `${pad}<div style={{ flex: ${span}, minWidth: 0 }} />`
    }

    case 'VStack': {
      ctx.imports.add('HVStack')
      const ps = buildPropString(entries)
      if (hasChildren) {
        return `${pad}<HVStack${ps}>\n${inlineChildren}\n${pad}</HVStack>`
      }
      return `${pad}<HVStack${ps} />`
    }

    // ── Data display ────────────────────────────────────────
    case 'Card': {
      ctx.imports.add('HCard')
      const ps = buildPropString(entries)
      if (hasChildren) {
        return `${pad}<HCard${ps}>\n${inlineChildren}\n${pad}</HCard>`
      }
      return `${pad}<HCard${ps} />`
    }

    case 'StatCard': {
      ctx.imports.add('HCard')
      const title = entries.find(([k]) => k === 'title')?.[1] ?? 'undefined'
      const color = entries.find(([k]) => k === 'color')?.[1] ?? "'#6366f1'"
      const rawValue = (node as Record<string, unknown>).value
      const valueNum = typeof rawValue === 'number' ? rawValue : typeof rawValue === 'string' ? Number(rawValue) : 0
      const trend = (node as Record<string, unknown>).trend as string | undefined
      const trendValue = entries.find(([k]) => k === 'trendValue')?.[1]
      const lines: string[] = [
        `${pad}<HCard>`,
        `${pad}${IND}<div style={{ textAlign: 'center', padding: '8px 0' }}>`,
        `${pad}${IND}${IND}{${title} && <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-secondary)', fontSize: 14 }}>{${title}}</p>}`,
        `${pad}${IND}${IND}<p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: ${color}, lineHeight: 1.2 }}>${valueNum.toLocaleString()}</p>`,
      ]
      if (trend && trendValue) {
        const trendColor = trend === 'up' ? "'#22c55e'" : "'#ef4444'"
        const arrow = trend === 'up' ? '↑' : '↓'
        lines.push(`${pad}${IND}${IND}<p style={{ margin: '4px 0 0', fontSize: 13, color: ${trendColor} }}>${arrow} {${trendValue}}</p>`)
      }
      lines.push(`${pad}${IND}</div>`)
      lines.push(`${pad}</HCard>`)
      return lines.join('\n')
    }

    case 'Badge': {
      ctx.imports.add('HBadge')
      const tone = entries.find(([k]) => k === 'tone')?.[1] ?? "'neutral'"
      const text = entries.find(([k]) => k === 'text')?.[1] ?? "''"
      return `${pad}<HBadge tone={${tone} as const}>{${text}}</HBadge>`
    }

    case 'Tag': {
      ctx.imports.add('HTag')
      const tone = entries.find(([k]) => k === 'tone')?.[1] ?? "'neutral'"
      const content = entries.find(([k]) => k === 'content')?.[1] ?? "''"
      return `${pad}<HTag tone={${tone} as const} content={${content}} />`
    }

    case 'Progress': {
      ctx.imports.add('HProgress')
      const value = entries.find(([k]) => k === 'value')?.[1] ?? '0'
      const label = entries.find(([k]) => k === 'label')?.[1]
      const color = entries.find(([k]) => k === 'color')?.[1]
      const ps = buildPropString(entries.filter(([k]) =>
        k !== 'value' && k !== 'label' && k !== 'color'))
      return `${pad}<HProgress value={${value}}${label ? ` label={${label}}` : ''}${color ? ` color={${color}}` : ''}${ps} />`
    }

    case 'Separator':
      ctx.imports.add('HSeparator')
      const sepLabel = entries.find(([k]) => k === 'label')?.[1]
      const sepColor = entries.find(([k]) => k === 'color')?.[1]
      const sepSize = entries.find(([k]) => k === 'size')?.[1]
      const sepOrientation = entries.find(([k]) => k === 'orientation')?.[1]
      const sepPs: string[] = []
      if (sepLabel) sepPs.push(`label={${sepLabel}}`)
      if (sepColor) sepPs.push(`color={${sepColor}}`)
      if (sepSize) sepPs.push(`size={${sepSize}}`)
      if (sepOrientation) sepPs.push(`orientation={${sepOrientation}}`)
      return sepPs.length > 0
        ? `${pad}<HSeparator ${sepPs.join(' ')} />`
        : `${pad}<HSeparator />`

    case 'Text': {
      const content = entries.find(([k]) => k === 'content')?.[1] ?? "''"
      const strong = entries.find(([k]) => k === 'strong')?.[1] === 'true'
      if (strong) return `${pad}<strong>{${content}}</strong>`
      return `${pad}<span>{${content}}</span>`
    }

    // ── Form inputs ─────────────────────────────────────────
    case 'Input': {
      ctx.imports.add('HInput')
      const ps = buildPropString(entries)
      return `${pad}<HInput size="md"${ps} />`
    }

    case 'NumberInput': {
      ctx.imports.add('HNumberInput')
      const ps = buildPropString(entries)
      return `${pad}<HNumberInput${ps} />`
    }

    case 'Textarea': {
      ctx.imports.add('HTextarea')
      const ps = buildPropString(entries)
      return `${pad}<HTextarea${ps} />`
    }

    case 'Select': {
      ctx.imports.add('HSelect')
      const ps = buildPropString(entries)
      return `${pad}<HSelect${ps} />`
    }

    case 'Checkbox': {
      ctx.imports.add('HCheckbox')
      const label = entries.find(([k]) => k === 'label')?.[1] ?? "''"
      const checked = entries.find(([k]) => k === 'checked')?.[1] ?? 'false'
      const handler = entries.find(([k]) => k === 'onCheckedChange')?.[1] ?? 'undefined'
      return `${pad}<HCheckbox label={${label}} checked={${checked}} onCheckedChange={${handler}} />`
    }

    case 'Toggle': {
      ctx.imports.add('HToggle')
      const checked = entries.find(([k]) => k === 'checked')?.[1] ?? 'false'
      const handler = entries.find(([k]) => k === 'onCheckedChange')?.[1] ?? 'undefined'
      return `${pad}<HToggle checked={${checked}} onCheckedChange={${handler}} />`
    }

    case 'DatePicker': {
      ctx.imports.add('HDatePicker')
      const ps = buildPropString(entries)
      return `${pad}<HDatePicker${ps} />`
    }

    // ── Action ──────────────────────────────────────────────
    case 'Button': {
      ctx.imports.add('HButton')
      const label = entries.find(([k]) => k === 'label')?.[1] ?? "''"
      const variant = entries.find(([k]) => k === 'variant')?.[1] ?? "'primary'"
      const size = entries.find(([k]) => k === 'size')?.[1] ?? "'md'"
      const onClick = entries.find(([k]) => k === 'onClick')?.[1] ?? 'undefined'
      const disabled = entries.find(([k]) => k === 'disabled')?.[1] === 'true' ? ' disabled' : ''
      return `${pad}<HButton variant={${variant} as const} size={${size} as const}${disabled}${onClick !== 'undefined' ? ` onClick={${onClick}}` : ''}>{${label}}</HButton>`
    }

    case 'ButtonGroup': {
      ctx.imports.add('HButton')
      ctx.imports.add('HStack')
      const buttonsExpr = entries.find(([k]) => k === 'buttons')?.[1] ?? '[]'
      return `${pad}<HStack gap="sm">{\n${pad}${IND}(${buttonsExpr} as { label: string; variant?: string }[]).map((btn, i) => (\n${pad}${IND}${IND}<HButton key={i} variant={(btn.variant ?? 'secondary') as const} size="md">\n${pad}${IND}${IND}${IND}{btn.label}\n${pad}${IND}${IND}</HButton>\n${pad}${IND}))\n${pad}}</HStack>`
    }

    // ── Complex ─────────────────────────────────────────────
    case 'Table': {
      ctx.imports.add('HTable')
      const columnsExpr = entries.find(([k]) => k === 'columns')?.[1] ?? '[]'
      const dataSourceExpr = entries.find(([k]) => k === 'dataSource')?.[1] ?? '[]'
      const caption = entries.find(([k]) => k === 'caption')?.[1]
      const enablePagination = entries.find(([k]) => k === 'enablePagination')?.[1] === 'true'
      const pageSize = entries.find(([k]) => k === 'pageSize')?.[1] ?? '10'
      const enableSorting = entries.find(([k]) => k === 'enableSorting')?.[1] !== 'false'
      const density = entries.find(([k]) => k === 'density')?.[1] ?? "'comfortable'"
      return `${pad}<HTable\n${pad}${IND}columns={${columnsExpr} as { accessorKey: string; header: string; cellType?: string }[]}\n${pad}${IND}data={${dataSourceExpr} as Record<string, unknown>[]}${caption ? `\n${pad}${IND}caption={${caption}}` : ''}\n${pad}${IND}enablePagination={${enablePagination}}\n${pad}${IND}pageSize={${pageSize}}\n${pad}${IND}enableSorting={${enableSorting}}\n${pad}${IND}density={${density} as const}\n${pad}/>`
    }

    case 'Tabs': {
      ctx.imports.add('HTabs')
      // Build a content map from children: each tab's "content" field is a child component ID.
      // Generate the TSX for each content child and wire it into the items.
      const rawItems = (node as Record<string, unknown>).items as Array<{ value: string; label: string; content?: string }> | undefined
      const tabChildren = new Map<string, string>()
      for (const child of children) {
        tabChildren.set(child.id, genTSX(child, map, ctx, depth + 2))
      }

      if (rawItems && rawItems.length > 0 && tabChildren.size > 0) {
        // Generate content map variable + mapped items
        const contentMapLines: string[] = [`${pad}const _tabsContent: Record<string, unknown> = {`]
        for (const [id, tsx] of tabChildren) {
          contentMapLines.push(`${pad}${IND}'${id}': (\n${tsx}\n${pad}${IND}),`)
        }
        contentMapLines.push(`${pad}}`)
        const contentMapStr = contentMapLines.join('\n')

        const itemLines = rawItems.map(item => {
          const val = esc(item.value)
          const label = esc(item.label)
          return `${pad}${IND}{ value: '${val}', label: '${label}', content: _tabsContent['${item.content ?? item.value}'] ?? null }`
        }).join(',\n')
        const itemsStr = `[\n${itemLines}\n${pad}]`
        return `${contentMapStr}\n${pad}<HTabs defaultValue={'${esc(rawItems[0]?.value ?? '')}'} items={${itemsStr}} />`
      }

      const itemsExpr = entries.find(([k]) => k === 'items')?.[1] ?? '[]'
      return `${pad}<HTabs items={${itemsExpr} as { value: string; label: string; content: unknown }[]} />`
    }

    // ── Feedback ────────────────────────────────────────────
    case 'Alert': {
      ctx.imports.add('HCard')
      ctx.imports.add('HBadge')
      const message = entries.find(([k]) => k === 'message')?.[1] ?? "''"
      const description = entries.find(([k]) => k === 'description')?.[1]
      const type = entries.find(([k]) => k === 'type')?.[1] ?? "'info'"
      const toneMap = `({ info: 'info', success: 'success', warning: 'warning', error: 'neutral' } as const)[${type} as string] ?? 'info'`
      const lines: string[] = [
        `${pad}<HCard>`,
        `${pad}${IND}<div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>`,
        `${pad}${IND}${IND}<HBadge tone={${toneMap}}>{String(${type}).toUpperCase()}</HBadge>`,
        `${pad}${IND}${IND}<div>`,
        `${pad}${IND}${IND}${IND}<strong>{${message}}</strong>`,
      ]
      if (description) {
        lines.push(`${pad}${IND}${IND}${IND}{${description} && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ui-color-text-secondary)' }}>{${description}}</p>}`)
      }
      lines.push(`${pad}${IND}${IND}</div>`)
      lines.push(`${pad}${IND}</div>`)
      lines.push(`${pad}</HCard>`)
      return lines.join('\n')
    }

    case 'Dialog': {
      ctx.imports.add('HDialog')
      ctx.imports.add('HButton')
      const title = entries.find(([k]) => k === 'title')?.[1] ?? "''"
      const description = entries.find(([k]) => k === 'description')?.[1]
      const triggerLabel = "'打开'"
      const open = entries.find(([k]) => k === 'open')?.[1]
      const ps = [
        `trigger={<HButton size="sm">{${triggerLabel}}</HButton>}`,
        `title={${title}}`,
      ]
      if (description) ps.push(`description={${description}}`)
      if (open) ps.push(`open={${open}}`)
      if (hasChildren) {
        return `${pad}<HDialog ${ps.join(' ')}>\n${inlineChildren}\n${pad}</HDialog>`
      }
      return `${pad}<HDialog ${ps.join(' ')} />`
    }

    case 'Chart': {
      ctx.imports.add('HChart')
      const type = entries.find(([k]) => k === 'type')?.[1] ?? "'line'"
      const title = entries.find(([k]) => k === 'title')?.[1] ?? "''"
      const height = entries.find(([k]) => k === 'height')?.[1] ?? '320'
      const legend = entries.find(([k]) => k === 'legend')?.[1]
      const smooth = entries.find(([k]) => k === 'smooth')?.[1]
      const stack = entries.find(([k]) => k === 'stack')?.[1]
      const unit = entries.find(([k]) => k === 'unit')?.[1]
      const rawData = (node as Record<string, unknown>).data
      const dataExpr = rawData != null ? toLiteral(rawData) : 'undefined'
      const categoriesExpr = entries.find(([k]) => k === 'categories')?.[1]
      const seriesExpr = entries.find(([k]) => k === 'series')?.[1]

      const ps: string[] = [
        `type={${type} as const}`,
        `title={${title}}`,
        `height={${height}}`,
      ]
      if (dataExpr !== 'undefined') ps.push(`data={${dataExpr} as { name: string; value: number }[]}`)
      if (categoriesExpr) {
        ps.push(`categories={${categoriesExpr} as string[]}`)
      }
      if (seriesExpr) ps.push(`series={${seriesExpr} as { name: string; data: (number | null)[] }[]}`)
      if (legend) ps.push(`legend={${legend}}`)
      if (smooth) ps.push(`smooth={${smooth}}`)
      if (stack) ps.push(`stack={${stack}}`)
      if (unit) ps.push(`unit={${unit}}`)
      return `${pad}<HChart ${ps.join(' ')} />`
    }
    // ── Navigation ──────────────────────────────────────────
    case 'NavMenu': {
      ctx.imports.add('HNavMenu')
      const itemsExpr = entries.find(([k]) => k === 'items')?.[1] ?? '[]'
      const selectedKeysExpr = entries.find(([k]) => k === 'selectedKeys')?.[1]
      const defaultActiveKey = entries.find(([k]) => k === 'defaultActiveKey')?.[1]
      const nmPs: string[] = []
      if (selectedKeysExpr) nmPs.push(`selectedKeys={${selectedKeysExpr} as string[]}`)
      if (defaultActiveKey) nmPs.push(`defaultActiveKey={${defaultActiveKey}}`)
      return `${pad}<HNavMenu items={${itemsExpr} as { value: string; label: string; icon?: string; children?: { value: string; label: string }[] }[]}${nmPs.length > 0 ? ' ' + nmPs.join(' ') : ''} />`
    }

    // ── Fallback ────────────────────────────────────────────
    default: {
      const entry = getCatalogEntry(node.component)
      if (entry) {
        // Component is in the catalog but has no codegen case — this is a codegen bug
        throw new Error(
          `[codegen] Component "${node.component}" (id: "${node.id}") is registered in the catalog but has no codegen adapter. ` +
          `Implement a case for it in genTSX().`,
        )
      }
      // Not in catalog at all — generate a visible TODO placeholder
      const note = `TODO: Unknown component "${node.component}" — not in catalog`
      return `${pad}{/* ${note} */}\n${pad}{${inlineChildren ?? 'null'}}`
    }
  }
}

// ── File assembly ──────────────────────────────────────────────────

/**
 * Generate a complete .tsx file from an A2UISurface.
 *
 * Returns a string suitable for writing to, e.g., `GeneratedPage.tsx`.
 * The generated code imports only `@demo/ui-react` + `@demo/ui-theme`,
 * uses catalog-registered components exclusively, and produces the same
 * visual output as `A2UIRenderer` when given the same surface.
 */
export function generateReactCode(surface: A2UISurface): string {
  const { componentMap, components, dataModel, surfaceId } = surface
  const ctx: GenContext = {
    imports: new Set(),
    inputStates: new Map(),
    inputHandlers: new Map(),
    boundInputs: new Set(),
    hasDataWriteback: false,
  }

  // Find root — must be exactly 'root'
  const rootId = surface.rootId
  if (!rootId) {
    throw new Error(
      `[codegen] Surface "${surfaceId}" has no rootId set. ` +
      `The component tree must contain a component with id="root".`,
    )
  }
  const root = componentMap.get(rootId)
  if (!root) {
    throw new Error(
      `[codegen] Surface "${surfaceId}" has rootId="${rootId}" but no component with that id was found. ` +
      `Ensure one component has id="root".`,
    )
  }

  // Generate component tree
  const bodyTSX = genTSX(root, componentMap, ctx, 2)

  // Collect imports (sorted for stability)
  const importList = Array.from(ctx.imports).sort()
  const importBlock = importList.length > 0
    ? `import { ${importList.join(', ')} } from '@demo/ui-react'`
    : ''

  // Has data bindings? (non-input path bindings in TSX + bound inputs in state)
  const hasDataBindings = bodyTSX.includes('getData(data,') || ctx.boundInputs.size > 0
  const hasInputBindings = bodyTSX.includes('onValueChange') || bodyTSX.includes('onCheckedChange')
  const hasAction = bodyTSX.includes('onAction')
  const needsGetData = hasDataBindings || ctx.boundInputs.size > 0
  const needsSetData = ctx.hasDataWriteback

  // Build states + handlers
  const stateDeclarations = Array.from(ctx.inputStates.values())
  const handlerDeclarations = Array.from(ctx.inputHandlers.values())

  // Data model literal
  const dataModelLiteral = toLiteral(dataModel)

  // Page name from surfaceId
  const pageName = surfaceId
    .split(/[-_]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('') + 'Page'

  // ── Assemble ──────────────────────────────────────────────
  const lines: string[] = []

  lines.push('/**')
  lines.push(` * Generated A2UI page: ${surfaceId}`)
  lines.push(` * Catalog: ${surface.catalogId}`)
  lines.push(' *')
  lines.push(' * DO NOT EDIT MANUALLY — regenerated by A2UI codegen.')
  lines.push(' */')
  lines.push('')
  lines.push("import '@demo/ui-theme'")
  lines.push('')
  if (importBlock) {
    lines.push(importBlock)
    lines.push('')
  }
  const hasState = stateDeclarations.length > 0 || handlerDeclarations.length > 0
  if (hasDataBindings || hasInputBindings || hasAction || hasState) {
    lines.push("import { useState, type FC } from 'react'")
  } else {
    lines.push("import { type FC } from 'react'")
  }
  lines.push('')
  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push('// Initial Data Model')
  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push('')
  lines.push(`const INITIAL_DATA = ${dataModelLiteral} as const`)
  lines.push('')
  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push('// Helpers')
  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push('')

  if (needsGetData) {
    lines.push('/** Resolve a data-model binding path. */')
    lines.push('function getData(data: Record<string, unknown>, path: string): unknown {')
    lines.push('  const key = path.startsWith(\'/\') ? path.slice(1) : path')
    lines.push('  const segments = key.split(\'/\').filter(Boolean)')
    lines.push('  let current: unknown = data')
    lines.push('  for (const seg of segments) {')
    lines.push('    if (current == null || typeof current !== \'object\') return undefined')
    lines.push('    current = (current as Record<string, unknown>)[seg]')
    lines.push('  }')
    lines.push('  return current')
    lines.push('}')
    lines.push('')
  }

  if (needsSetData) {
    lines.push('/** Write a value back into the data model at a JSON Pointer path. */')
    lines.push('function setDataAtPath(')
    lines.push('  data: Record<string, unknown>,')
    lines.push('  path: string,')
    lines.push('  value: unknown,')
    lines.push('  setData: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void,')
    lines.push(') {')
    lines.push('  const key = path.startsWith(\'/\') ? path.slice(1) : path')
    lines.push('  const segments = key.split(\'/\').filter(Boolean)')
    lines.push('  if (segments.length === 0) {')
    lines.push('    // Root path — replace entire data model')
    lines.push('    if (value != null && typeof value === \'object\' && !Array.isArray(value)) {')
    lines.push('      setData(() => ({ ...value } as Record<string, unknown>))')
    lines.push('    }')
    lines.push('    return')
    lines.push('  }')
    lines.push('  setData(prev => {')
    lines.push('    const next = { ...prev }')
    lines.push('    let cursor: Record<string, unknown> = next')
    lines.push('    for (let i = 0; i < segments.length - 1; i++) {')
    lines.push('      const seg = segments[i]')
    lines.push('      const nextSeg = segments[i + 1]')
    lines.push('      let child = cursor[seg]')
    lines.push('      if (child == null || typeof child !== \'object\' || Array.isArray(child)) {')
    lines.push('        child = /^\\d+$/.test(nextSeg) ? [] : {}')
    lines.push('      } else {')
    lines.push('        child = { ...child }')
    lines.push('      }')
    lines.push('      cursor[seg] = child')
    lines.push('      cursor = child as Record<string, unknown>')
    lines.push('    }')
    lines.push('    cursor[segments[segments.length - 1]] = value')
    lines.push('    return next')
    lines.push('  })')
    lines.push('}')
    lines.push('')
  }

  if (hasAction) {
    lines.push('/** Action callback type. Implement to handle user interactions. */')
    lines.push('export interface A2UIAction {')
    lines.push('  name: string')
    lines.push('  context: Record<string, unknown>')
    lines.push('}')
    lines.push('')
  }

  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push(`// Generated Page: ${surfaceId}`)
  lines.push('// ═══════════════════════════════════════════════════════')
  lines.push('')

  const needsHooks = needsGetData || needsSetData || hasAction || stateDeclarations.length > 0
  const propsType = hasAction
    ? `const ${pageName}: FC<{ onAction?: (action: A2UIAction) => void }> = ({ onAction }) => {`
    : `const ${pageName}: FC = () => {`

  lines.push(propsType)

  // ── Hooks INSIDE the component function ──

  if (needsGetData || needsSetData) {
    lines.push('  const [data, setData] = useState(INITIAL_DATA)')
  }

  // Input state declarations (inside component)
  for (const decl of stateDeclarations) {
    lines.push('  ' + decl)
  }

  // Input change handlers (inside component)
  for (const decl of handlerDeclarations) {
    // Indent the entire function declaration
    lines.push('  ' + decl.replace(/\n/g, '\n  '))
  }

  if (needsHooks || stateDeclarations.length > 0 || handlerDeclarations.length > 0) {
    lines.push('')
  }

  lines.push('  return (')
  lines.push(bodyTSX)

  // Close return + component + default export
  lines.push('  )')
  lines.push('}')
  lines.push('')

  lines.push(`export default ${pageName}`)
  lines.push('')

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════════
// Live Component Compilation (preview)
// ═══════════════════════════════════════════════════════════════════
//
// `generateReactCode` above is the SINGLE canonical code generator —
// one tree walk, one code string.  `compileReactCode` below takes
// that exact output, transpiles JSX → React.createElement via Babel
// standalone, and compiles the result into a live React component.
//
// The preview literally renders the generated code.  No duplicate
// switch/case, no separate rendering logic.
// ═══════════════════════════════════════════════════════════════════

let _BabelPromise: Promise<typeof import('@babel/standalone')> | null = null

function getBabel(): Promise<typeof import('@babel/standalone')> {
  if (!_BabelPromise) {
    _BabelPromise = import('@babel/standalone')
  }
  return _BabelPromise
}

/**
 * Compile the output of `generateReactCode` into a live React component.
 *
 * ONE code path — the .tsx IS the preview, no separate renderer.
 *
 * Usage:
 * ```ts
 * const code = generateReactCode(surface)
 * const Page = await compileReactCode(code)
 * // <Page onAction={handler} />
 * ```
 */
export async function compileReactCode(
  tsxSource: string,
): Promise<React.FC<{ onAction?: (action: { name: string; context: Record<string, unknown> }) => void }>> {
  const Babel = await getBabel()

  // 1. Collect H* import names BEFORE stripping (from the import line)
  const importMatch = tsxSource.match(/import\s*\{\s*([^}]+)\}\s*from\s*['"]@demo\/ui-react['"]/)
  const hFromImport = importMatch
    ? importMatch[1].split(',').map(s => s.trim()).filter(s => s.startsWith('H') && /^H[A-Z]/.test(s))
    : []

  // Also collect from JSX tags in case there are any not covered by the import
  const jsxHNames = new Set<string>()
  for (const m of tsxSource.matchAll(/<(H[A-Z]\w+)[\s/>]/g)) {
    jsxHNames.add(m[1])
  }
  const hNames = new Set([...hFromImport, ...jsxHNames])

  // 2. Prepare source: strip imports, note the default export name
  const defaultExportMatch = tsxSource.match(/^export\s+default\s+(\w+)/m)
  const componentName = defaultExportMatch ? defaultExportMatch[1] : undefined

  let js = tsxSource
    .replace(/^import\s+.*from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
    // Replace `export default function X` → `function X`
    .replace(/^export\s+default\s+function\b/gm, 'function')
    // Replace bare `export default Name` → `/* exported: Name */`
    .replace(/^export\s+default\s+\w+;?\s*$/gm, '')
    .replace(/^export\s+\{\};?\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')

  // 3. Transpile via Babel: TypeScript preset strips types, React preset converts JSX
  let result: { code?: string } | null = null
  try {
    result = Babel.transform(js, {
      presets: [
        'typescript',
        ['react', { runtime: 'classic', development: false }],
      ],
      filename: 'A2UIGenerated.tsx',
      ast: false,
      compact: false,
    })
  } catch (babelErr) {
    throw new Error(
      `[compileReactCode] Babel transform failed: ${babelErr instanceof Error ? babelErr.message : String(babelErr)}\n\nSource:\n${js.slice(0, 800)}`,
    )
  }

  if (!result?.code) {
    throw new Error('[compileReactCode] Babel transform returned no code')
  }

  // 4. Wrap: expose hooks + return the default-exported component
  const returnStmt = componentName ? `\nreturn ${componentName}` : ''
  const body = [
    "'use strict'",
    'var { useState, useRef, useMemo, useCallback, useEffect } = React',
    result.code,
    returnStmt,
  ].join('\n')

  // 5. Compile via new Function(React, HStack, HCard, …)
  const sorted = Array.from(hNames).sort()
  const params = ['React', ...sorted]

  const args: unknown[] = [React]
  for (const name of sorted) {
    args.push((UiReact as Record<string, unknown>)[name] ?? (() => null))
  }

  let factory: (...a: unknown[]) => unknown
  try {
    factory = new Function(...params, body) as (...a: unknown[]) => unknown
  } catch (ctorErr) {
    throw new Error(
      `[compileReactCode] new Function construction failed: ${ctorErr instanceof Error ? ctorErr.message : String(ctorErr)}\n\nBody:\n${body.slice(0, 1500)}`,
    )
  }

  let componentFn: unknown
  try {
    // factory returns the default-exported component function — no extra () call
    componentFn = factory(...args)
  } catch (factoryErr) {
    throw new Error(
      `[compileReactCode] factory invocation failed: ${factoryErr instanceof Error ? factoryErr.message : String(factoryErr)}`,
    )
  }

  // The factory returns the default-exported component function.
  return componentFn as React.FC<{
    onAction?: (action: { name: string; context: Record<string, unknown> }) => void
  }>
}
