/**
 * A2UI Runtime Renderer — renders an A2UISurface directly via H* components.
 *
 * NO codegen.  Takes the parsed surface (componentMap + dataModel) and
 * recursively creates React elements.  This is what the preview shows by
 * default.  When the user clicks "生成代码", generateReactCode() produces
 * identical output from the SAME surface — guaranteeing 1:1 correspondence.
 */

import React, { useState, useCallback, type FC, type ReactNode } from 'react'
import * as UiReact from '@demo/ui-react'
import type { DatePickerValueChangeDetails } from '@demo/ui-core'
import type { A2UIComponent, A2UISurface, A2UIValue } from '../protocol/types'

// ── Types ─────────────────────────────────────────────────────────

interface RendererProps {
  surface: A2UISurface
  onAction?: (action: { name: string; context: Record<string, unknown> }) => void
}

type PropRecord = Record<string, unknown>

/** Data-model bound value marker. */
function isBoundValue(v: unknown): v is { path: string } {
  return (
    typeof v === 'object' && v !== null &&
    !Array.isArray(v) && 'path' in v &&
    typeof (v as Record<string, unknown>).path === 'string'
  )
}

/** Action value marker. */
function isActionValue(v: unknown): v is { name: string; context?: Record<string, unknown> } {
  return (
    typeof v === 'object' && v !== null &&
    !Array.isArray(v) && 'name' in v
  )
}

// ── Data model helpers ────────────────────────────────────────────

function getAtPath(data: Record<string, unknown>, path: string): unknown {
  const key = path.startsWith('/') ? path.slice(1) : path
  const segments = key.split('/').filter(Boolean)
  let current: unknown = data
  for (const seg of segments) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[seg]
  }
  return current
}

function setAtPath(
  prev: Record<string, A2UIValue>,
  path: string,
  value: unknown,
): Record<string, A2UIValue> {
  const key = path.startsWith('/') ? path.slice(1) : path
  const segments = key.split('/').filter(Boolean)
  if (segments.length === 0) {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return { ...value } as Record<string, A2UIValue>
    }
    return prev
  }
  const next = { ...prev } as Record<string, unknown>
  let cursor: Record<string, unknown> = next
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i]
    const nextSeg = segments[i + 1]
    let child = cursor[seg]
    if (child == null || typeof child !== 'object' || Array.isArray(child)) {
      child = /^\d+$/.test(nextSeg) ? [] : {}
    } else {
      child = { ...(child as Record<string, unknown>) }
    }
    cursor[seg] = child
    cursor = child as Record<string, unknown>
  }
  cursor[segments[segments.length - 1]] = value
  return next as Record<string, A2UIValue>
}

// ── META_KEYS we skip ─────────────────────────────────────────────

const META_KEYS = new Set(['id', 'component', 'weight', 'children', 'props'])

// ═══════════════════════════════════════════════════════════════════
// Component renderers
// ═══════════════════════════════════════════════════════════════════

/** Props resolved for a single A2UI component node. */
interface ResolvedProps {
  component: string
  props: PropRecord
  /** IDs of child components. */
  childIds: string[]
  /** Input field paths that are data-bound (for writeback). */
  boundFields: Map<string, string>
}

function resolveProps(
  node: A2UIComponent,
  data: Record<string, unknown>,
): ResolvedProps {
  const props: PropRecord = {}
  const childIds: string[] = (node.children as string[] | undefined) ?? []
  const boundFields = new Map<string, string>()

  for (const key of Object.keys(node)) {
    if (META_KEYS.has(key)) continue
    const v = (node as Record<string, unknown>)[key]
    if (v === undefined) continue

    if (isBoundValue(v)) {
      props[key] = getAtPath(data, v.path)
      boundFields.set(key, v.path)
    } else if (isActionValue(v)) {
      props[key] = v
    } else {
      props[key] = v
    }
  }

  return { component: node.component, props, childIds, boundFields }
}

// ── Leaf component renderers ──────────────────────────────────────

function StatCardRenderer({ props }: { props: PropRecord }) {
  const title = props.title as string | undefined
  const value = props.value as number | undefined
  const color = (props.color as string) ?? '#6366f1'
  const trend = props.trend as string | undefined
  const trendValue = props.trendValue as string | undefined

  return (
    <UiReact.HCard>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        {title && (
          <p style={{ margin: '0 0 8px', color: 'var(--ui-color-text-secondary)', fontSize: 14 }}>
            {title}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color, lineHeight: 1.2 }}>
          {value?.toLocaleString() ?? '—'}
        </p>
        {trend && trendValue && (
          <p style={{
            margin: '4px 0 0', fontSize: 13,
            color: trend === 'up' ? '#22c55e' : '#ef4444',
          }}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
    </UiReact.HCard>
  )
}

function TextRenderer({ props }: { props: PropRecord }) {
  const content = props.content as ReactNode ?? ''
  const strong = props.strong === true
  if (strong) return <strong>{content}</strong>
  return <span>{content}</span>
}

function BadgeRenderer({ props }: { props: PropRecord }) {
  const tone = (props.tone as string) ?? 'neutral'
  const text = (props.text as string) ?? ''
  return <UiReact.HBadge tone={tone as UiReact.HBadgeProps['tone']}>{text}</UiReact.HBadge>
}

function TagRenderer({ props }: { props: PropRecord }) {
  const tone = (props.tone as string) ?? 'neutral'
  const content = (props.content as string) ?? ''
  return <UiReact.HTag tone={tone as UiReact.HTagProps['tone']} content={content} />
}

function ProgressRenderer({ props }: { props: PropRecord }) {
  const value = (props.value as number) ?? 0
  const label = props.label as string | undefined
  return <UiReact.HProgress value={value} label={label} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function omit<P extends Record<string, unknown> = Record<string, unknown>>(obj: P, ...keys: string[]): P {
  const result = { ...obj }
  for (const k of keys) delete (result as Record<string, unknown>)[k]
  return result
}

function SeparatorRenderer({ props }: { props: PropRecord }) {
  return <UiReact.HSeparator {...omit(props, 'children')} />
}

// ── Input value change handler type ───────────────────────────────

type InputChangeHandler = (path: string, value: unknown) => void

function InputRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('value')
  const [localValue, setLocalValue] = useState<string>(String(props.value ?? ''))

  const handleChange = useCallback((d: { value: string | number }) => {
    const v = typeof d.value === 'number' ? String(d.value) : d.value
    setLocalValue(v)
    if (fieldPath && onValueChange) onValueChange(fieldPath, v)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HInput
      size="md"
      label={props.label as string}
      placeholder={props.placeholder as string}
      type={(props.type as UiReact.HInputProps['type']) ?? 'text'}
      required={Boolean(props.required)}
      disabled={Boolean(props.disabled)}
      value={fieldPath ? localValue : (props.value as string)}
      onValueChange={fieldPath ? handleChange : undefined}
    />
  )
}

function NumberInputRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('value')
  const [localValue, setLocalValue] = useState<number>(Number(props.value ?? 0))

  const handleChange = useCallback((d: { value: string | number }) => {
    const num = typeof d.value === 'string' ? Number(d.value) : d.value
    setLocalValue(num)
    if (fieldPath && onValueChange) onValueChange(fieldPath, num)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HNumberInput
      label={props.label as string}
      required={Boolean(props.required)}
      disabled={Boolean(props.disabled)}
      value={fieldPath ? localValue : (props.value as number)}
      onValueChange={fieldPath ? handleChange : undefined}
    />
  )
}

function TextareaRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('value')
  const [localValue, setLocalValue] = useState<string>(String(props.value ?? ''))

  const handleChange = useCallback((d: { value: string | number }) => {
    const v = typeof d.value === 'number' ? String(d.value) : d.value
    setLocalValue(v)
    if (fieldPath && onValueChange) onValueChange(fieldPath, v)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HTextarea
      label={props.label as string}
      placeholder={props.placeholder as string}
      rows={props.rows as number}
      required={Boolean(props.required)}
      disabled={Boolean(props.disabled)}
      value={fieldPath ? localValue : (props.value as string)}
      onValueChange={fieldPath ? handleChange : undefined}
    />
  )
}

function SelectRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('value')
  const [localValue, setLocalValue] = useState<string>(String(props.value ?? ''))

  const handleChange = useCallback((d: { value: string | number }) => {
    const v = typeof d.value === 'number' ? String(d.value) : d.value
    setLocalValue(v)
    if (fieldPath && onValueChange) onValueChange(fieldPath, v)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HSelect
      label={props.label as string}
      items={(props.items as Array<{ value: string; label: string }>) ?? []}
      value={fieldPath ? localValue : (props.value as string)}
      onValueChange={fieldPath ? handleChange : undefined}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CheckedChangeHandler = (d: { checked: boolean }) => void

function CheckboxRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('checked')
  const [localChecked, setLocalChecked] = useState<boolean>(Boolean(props.checked))

  const handleChange = useCallback((d: { checked: boolean }) => {
    setLocalChecked(d.checked)
    if (fieldPath && onValueChange) onValueChange(fieldPath, d.checked)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HCheckbox
      label={props.label as string}
      checked={fieldPath ? localChecked : Boolean(props.checked)}
      onCheckedChange={fieldPath ? handleChange : (props.onCheckedChange as CheckedChangeHandler)}
    />
  )
}

function ToggleRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('checked')
  const [localChecked, setLocalChecked] = useState<boolean>(Boolean(props.checked))

  const handleChange = useCallback((d: { checked: boolean }) => {
    setLocalChecked(d.checked)
    if (fieldPath && onValueChange) onValueChange(fieldPath, d.checked)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HToggle
      checked={fieldPath ? localChecked : Boolean(props.checked)}
      onCheckedChange={fieldPath ? handleChange : (props.onCheckedChange as CheckedChangeHandler)}
    />
  )
}

function DatePickerRenderer({ props, boundFields, onValueChange }: {
  props: PropRecord
  boundFields: Map<string, string>
  onValueChange?: InputChangeHandler
}) {
  const fieldPath = boundFields.get('value')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localValue, setLocalValue] = useState<any>(props.value)

  const handleChange = useCallback((details: DatePickerValueChangeDetails) => {
    setLocalValue(details.value)
    if (fieldPath && onValueChange) onValueChange(fieldPath, details.value)
  }, [fieldPath, onValueChange])

  return (
    <UiReact.HDatePicker
      label={props.label as string}
      value={fieldPath ? localValue : props.value}
      onValueChange={fieldPath ? handleChange : undefined}
    />
  )
}

function ButtonRenderer({ props, onAction }: {
  props: PropRecord
  onAction?: (action: { name: string; context: Record<string, unknown> }) => void
}) {
  const label = (props.label as string) ?? ''
  const variant = (props.variant as string) ?? 'primary'
  const size = (props.size as string) ?? 'md'
  const disabled = props.disabled === true
  const action = props.action as { name: string; context?: Record<string, unknown> } | undefined

  const handleClick = action
    ? () => onAction?.({ name: action.name, context: action.context ?? {} })
    : undefined

  return (
    <UiReact.HButton
      variant={variant as UiReact.HButtonProps['variant']}
      size={size as UiReact.HButtonProps['size']}
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </UiReact.HButton>
  )
}

function ButtonGroupRenderer({ props }: { props: PropRecord }) {
  const buttons = (props.buttons as Array<{ label: string; variant?: string }>) ?? []
  return (
    <UiReact.HStack gap="sm">
      {buttons.map((btn, i) => (
        <UiReact.HButton
          key={i}
          variant={(btn.variant ?? 'secondary') as UiReact.HButtonProps['variant']}
          size="md"
        >
          {btn.label}
        </UiReact.HButton>
      ))}
    </UiReact.HStack>
  )
}

function TableRenderer({ props }: { props: PropRecord }) {
  return (
    <UiReact.HTable
      columns={(props.columns as Array<{ accessorKey: string; header: string }>) ?? []}
      data={(props.dataSource as Array<Record<string, unknown>>) ?? []}
      caption={props.caption as string}
      enablePagination={Boolean(props.enablePagination)}
      pageSize={(props.pageSize as number) ?? 10}
      enableSorting={props.enableSorting !== false}
      density={((props.density as string) ?? 'comfortable') as UiReact.HTableProps['density']}
    />
  )
}

function AlertRenderer({ props }: { props: PropRecord }) {
  const message = (props.message as string) ?? ''
  const description = props.description as string | undefined
  const type = (props.type as string) ?? 'info'
  const toneMap: Record<string, string> = { info: 'info', success: 'success', warning: 'warning', error: 'neutral' }

  return (
    <UiReact.HCard>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <UiReact.HBadge tone={(toneMap[type] ?? 'info') as UiReact.HBadgeProps['tone']}>
          {String(type).toUpperCase()}
        </UiReact.HBadge>
        <div>
          <strong>{message}</strong>
          {description && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ui-color-text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
      </div>
    </UiReact.HCard>
  )
}

function ChartRenderer({ props }: { props: PropRecord }) {
  return (
    <UiReact.HChart
      type={(props.type as UiReact.HChartProps['type']) ?? 'line'}
      title={props.title as string}
      height={props.height as number}
      data={props.data as Array<{ name: string; value: number }>}
      categories={props.categories as string[]}
      series={props.series as Array<{ name: string; data: (number | null)[] }>}
      legend={props.legend as boolean}
      smooth={props.smooth as boolean}
      stack={props.stack as boolean}
      unit={props.unit as string}
    />
  )
}

function NavMenuRenderer({ props }: { props: PropRecord }) {
  const rawItems = (props.items as Array<{ value: string; label: string }>) ?? []
  // NavMenuItemContract requires `key` — use value as key
  const items = rawItems.map(item => ({ ...item, key: item.value }))
  return (
    <UiReact.HNavMenu
      items={items as Array<UiReact.HNavMenuItem>}
      selectedKeys={props.selectedKeys as string[]}
    />
  )
}

function TabsRenderer({ props, renderChild }: {
  props: PropRecord
  renderChild: (id: string) => ReactNode
}) {
  const rawItems = (props.items as Array<{ value: string; label: string; content?: string }>) ?? []
  const contentMap: Record<string, ReactNode> = {}
  const items = rawItems.map(item => {
    const contentId = item.content ?? item.value
    contentMap[item.value] = renderChild(contentId)
    return { value: item.value, label: item.label, key: item.value, content: contentMap[item.value] }
  })

  return <UiReact.HTabs defaultValue={rawItems[0]?.value} items={items} />
}

function DialogRenderer({ props, renderChild }: {
  props: PropRecord
  renderChild: (id: string) => ReactNode
}) {
  const title = (props.title as string) ?? ''
  const description = props.description as string | undefined
  const open = props.open as boolean | undefined
  const childIds = (props.childIds as string[]) ?? []

  return (
    <UiReact.HDialog
      trigger={<UiReact.HButton size="sm">打开</UiReact.HButton>}
      title={title}
      description={description}
      open={open}
    >
      {childIds.map(id => (
        <React.Fragment key={id}>{renderChild(id)}</React.Fragment>
      ))}
    </UiReact.HDialog>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Main recursive renderer
// ═══════════════════════════════════════════════════════════════════

/**
 * Recursively render one A2UI component node.
 */
function A2UINode({
  node,
  map,
  data,
  onDataChange,
  onAction,
}: {
  node: A2UIComponent
  map: Map<string, A2UIComponent>
  data: Record<string, unknown>
  onDataChange?: InputChangeHandler
  onAction?: (action: { name: string; context: Record<string, unknown> }) => void
}): ReactNode {
  const { component, props, childIds, boundFields } = resolveProps(node, data)
  const childNodes = childIds.map(id => map.get(id)).filter((c): c is A2UIComponent => c != null)

  const renderChild = (id: string): ReactNode => {
    const child = map.get(id)
    if (!child) return null
    return (
      <A2UINode
        key={id}
        node={child}
        map={map}
        data={data}
        onDataChange={onDataChange}
        onAction={onAction}
      />
    )
  }

  const renderChildren = () => childNodes.map(c => renderChild(c.id))

  // ── Layout ──────────────────────────────────────────────
  if (component === 'Page') {
    const title = props.title as string
    const subtitle = props.subtitle as string
    return (
      <div className="a2ui-page" style={{ padding: 0 }}>
        {title && <h1 className="a2ui-page__title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{title}</h1>}
        {subtitle && <p className="a2ui-page__subtitle" style={{ margin: '0 0 20px', color: 'var(--ui-color-text-secondary)', fontSize: 14 }}>{subtitle}</p>}
        <div className="a2ui-page__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderChildren()}
        </div>
      </div>
    )
  }
  if (component === 'Row') {
    const gap = (props.gap as string) ?? 'md'
    const justify = props.justify as UiReact.HStackProps['justify']
    return <UiReact.HStack gap={gap as UiReact.HStackProps['gap']} justify={justify}>{renderChildren()}</UiReact.HStack>
  }
  if (component === 'Col') {
    const span = (props.span as number) ?? 1
    return (
      <div style={{ flex: span, minWidth: 0 }}>
        {renderChildren()}
      </div>
    )
  }
  if (component === 'VStack') {
    const gap = (props.gap as string) ?? 'md'
    return <UiReact.HVStack gap={gap as UiReact.HVStackProps['gap']}>{renderChildren()}</UiReact.HVStack>
  }

  // ── Data display ────────────────────────────────────────
  if (component === 'Card') {
    const { children: _c, ...rest } = props
    return <UiReact.HCard {...rest}>{renderChildren()}</UiReact.HCard>
  }
  if (component === 'StatCard') return <StatCardRenderer props={props} />
  if (component === 'Badge') return <BadgeRenderer props={props} />
  if (component === 'Tag') return <TagRenderer props={props} />
  if (component === 'Progress') return <ProgressRenderer props={props} />
  if (component === 'Separator') return <SeparatorRenderer props={props} />
  if (component === 'Text') return <TextRenderer props={props} />

  // ── Form inputs ─────────────────────────────────────────
  if (component === 'Input') return <InputRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'NumberInput') return <NumberInputRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'Textarea') return <TextareaRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'Select') return <SelectRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'Checkbox') return <CheckboxRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'Toggle') return <ToggleRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />
  if (component === 'DatePicker') return <DatePickerRenderer props={props} boundFields={boundFields} onValueChange={onDataChange} />

  // ── Actions ─────────────────────────────────────────────
  if (component === 'Button') return <ButtonRenderer props={props} onAction={onAction} />
  if (component === 'ButtonGroup') return <ButtonGroupRenderer props={props} />

  // ── Complex ─────────────────────────────────────────────
  if (component === 'Table') return <TableRenderer props={props} />
  if (component === 'Tabs') return <TabsRenderer props={props} renderChild={renderChild} />
  if (component === 'Chart') return <ChartRenderer props={props} />

  // ── Feedback ────────────────────────────────────────────
  if (component === 'Alert') return <AlertRenderer props={props} />
  if (component === 'Dialog') return <DialogRenderer props={props} renderChild={renderChild} />

  // ── Navigation ──────────────────────────────────────────
  if (component === 'NavMenu') return <NavMenuRenderer props={props} />

  // ── Fallback ────────────────────────────────────────────
  return (
    <div style={{ padding: 8, border: '1px dashed var(--ui-color-hairline)', borderRadius: 4, color: '#999', fontSize: 12 }}>
      TODO: {component}
      {childNodes.length > 0 && <div style={{ marginTop: 4 }}>{renderChildren()}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Public component
// ═══════════════════════════════════════════════════════════════════

/**
 * Render an A2UISurface directly via H* components.
 *
 * This is the runtime preview path.  It consumes the SAME A2UISurface
 * that generateReactCode() produces code from — so preview and
 * generated code are always 1:1.
 */
export const A2UIRenderer: FC<RendererProps> = ({ surface, onAction }) => {
  const { componentMap, dataModel, rootId } = surface
  const [data, setData] = useState<Record<string, A2UIValue>>(dataModel)

  const handleDataChange = useCallback((path: string, value: unknown) => {
    setData(prev => setAtPath(prev, path, value))
  }, [])

  const root = rootId ? componentMap.get(rootId) : undefined
  if (!root) {
    return (
      <div style={{ padding: 20, color: '#ef4444' }}>
        No root component found (expected id=&quot;root&quot;)
      </div>
    )
  }

  return (
    <A2UINode
      node={root}
      map={componentMap}
      data={data}
      onDataChange={handleDataChange}
      onAction={onAction}
    />
  )
}

export default A2UIRenderer
