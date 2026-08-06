import { StrictMode, useState, useRef, type FormEvent, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@demo/ui-theme'
import './production-theme.css'
import { buildSystemPrompt } from '../llm/prompt-builder'
import { catalog } from '../catalog/catalog'
import { parseA2UIMessages, A2UIParseError } from '../protocol/parser'
import type { A2UIUpdateComponentsMessage, A2UISurface, A2UIUpdateDataModelMessage } from '../protocol/types'
import { A2UI_VERSION } from '../protocol/types'
import { generateReactCode } from '../codegen/react'
import { A2UIRenderer } from '../renderer/react'
import { HDrawer, HNavMenu, HTextarea, type HNavMenuItem } from '@demo/ui-react'
import attendanceJsonl from '../../replica-attendance.jsonl?raw'

// ── LLM config ────────────────────────────────────────────────────

interface LLMConfig {
  apiKey: string
  baseUrl: string
  model: string
}

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: import.meta.env.VITE_A2UI_API_KEY ?? '',
  baseUrl: import.meta.env.VITE_A2UI_BASE_URL ?? 'https://api.deepseek.com/v1',
  model: import.meta.env.VITE_A2UI_MODEL ?? 'deepseek-v4-flash',
}

function loadConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem('a2ui-llm-config')
    if (raw) {
      const saved = JSON.parse(raw) as Partial<LLMConfig>
      return {
        ...DEFAULT_CONFIG,
        ...saved,
      }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG }
}

/** Extract JSONL content from an LLM response — strips markdown fences. */
function extractJSONL(text: string): string {
  // Try to extract from ```jsonl / ```json fences
  const fenceMatch = text.match(/```(?:jsonl|json)?\s*\n([\s\S]*?)\n```/)
  if (fenceMatch) return fenceMatch[1].trim()
  // Try to find the first 3-line JSONL block
  const lines = text.split('\n').filter(l => {
    const trimmed = l.trim()
    return trimmed.startsWith('{') && trimmed.includes('"version"')
  })
  if (lines.length >= 3) return lines.join('\n')
  // Fallback: return raw text
  return text.trim()
}

/**
 * A2UI Demo — Chat panel + preview panel.
 *
 * Architecture:
 * ┌──────────┬──────────────────────────┐
 * │ Chat     │  Runtime 预览 (default)   │
 * │ (prompt) │  ← 同一 A2UI JSON        │
 * │          │  查看 A2UI / 生成代码     │
 * └──────────┴──────────────────────────┘
 *
 * JSON → A2UIRenderer (runtime preview)  ← 默认，实时双向绑定
 * JSON → generateReactCode → .tsx         ← 点"生成代码"
 * 两者消费同一个 A2UISurface，保证 1:1 对应。
 */

// ── Sample A2UI payloads for quick preview ────────────────────────

const DASHBOARD_SAMPLE: A2UIUpdateComponentsMessage = {
  version: 'v0.9.1',
  updateComponents: {
  surfaceId: 'dashboard',
  components: [
    {
      id: 'root',
      component: 'Page',
      title: { path: '/title' },
      subtitle: { path: '/subtitle' },
      children: ['row-stats', 'row-main', 'row-chart'],
    },
    {
      id: 'row-stats',
      component: 'Row',
      gap: 'md',
      children: ['stat1', 'stat2', 'stat3', 'stat4'],
    },
    { id: 'stat1', component: 'StatCard', title: '总用户', value: 12850, color: '#6366f1', trend: 'up', trendValue: '12.5%' },
    { id: 'stat2', component: 'StatCard', title: '今日订单', value: 462, color: '#22c55e', trend: 'up', trendValue: '8.3%' },
    { id: 'stat3', component: 'StatCard', title: '活跃设备', value: 8921, color: '#f59e0b', trend: 'down', trendValue: '3.1%' },
    { id: 'stat4', component: 'StatCard', title: '转化率', value: 68.5, color: '#ec4899', trend: 'up', trendValue: '5.2%' },
    {
      id: 'row-main',
      component: 'Row',
      gap: 'lg',
      children: ['col-table', 'col-sidebar'],
    },
    {
      id: 'row-chart',
      component: 'Row',
      gap: 'lg',
      children: ['col-chart'],
    },
    {
      id: 'col-table',
      component: 'Col',
      span: 2,
      children: ['card-table'],
    },
    {
      id: 'card-table',
      component: 'Card',
      title: '最近订单',
      children: ['table-orders'],
    },
    {
      id: 'table-orders',
      component: 'Table',
      caption: { path: '/tableCaption' },
      columns: [
        { accessorKey: 'id', header: '订单号' },
        { accessorKey: 'customer', header: '客户' },
        { accessorKey: 'amount', header: '金额' },
        { accessorKey: 'status', header: '状态' },
      ],
      dataSource: [
        { id: 'ORD-001', customer: '张三', amount: '¥1,280', status: '已完成' },
        { id: 'ORD-002', customer: '李四', amount: '¥3,420', status: '处理中' },
        { id: 'ORD-003', customer: '王五', amount: '¥890', status: '已完成' },
        { id: 'ORD-004', customer: '赵六', amount: '¥5,100', status: '待支付' },
        { id: 'ORD-005', customer: '孙七', amount: '¥2,340', status: '已完成' },
      ],
      enablePagination: true,
      pageSize: 5,
    },
    {
      id: 'col-chart',
      component: 'Col',
      span: 2,
      children: ['card-chart'],
    },
    {
      id: 'card-chart',
      component: 'Card',
      title: '月度趋势',
      children: ['chart-monthly'],
    },
    {
      id: 'chart-monthly',
      component: 'Chart',
      title: '月度销售额',
      type: 'line',
      data: [
        { name: '1月', value: 12000 },
        { name: '2月', value: 19000 },
        { name: '3月', value: 15000 },
        { name: '4月', value: 22000 },
        { name: '5月', value: 28000 },
        { name: '6月', value: 25000 },
      ],
      height: 280,
      smooth: true,
    },
    {
      id: 'col-sidebar',
      component: 'Col',
      span: 1,
      children: ['card-info', 'card-nav'],
    },
    {
      id: 'card-info',
      component: 'Card',
      title: '系统状态',
      children: ['alert-status'],
    },
    { id: 'alert-status', component: 'Alert', type: 'success', message: '系统运行正常', description: '最后同步 3 分钟前' },
    {
      id: 'card-nav',
      component: 'Card',
      title: '快捷导航',
      children: ['nav-quick'],
    },
    {
      id: 'nav-quick',
      component: 'NavMenu',
      items: [
        { value: 'dashboard', label: '看板' },
        { value: 'orders', label: '订单管理' },
        { value: 'users', label: '用户管理' },
        { value: 'settings', label: '系统设置' },
      ],
    },
  ],
  },
}

const FORM_SAMPLE: A2UIUpdateComponentsMessage = {
  version: 'v0.9.1',
  updateComponents: {
  surfaceId: 'form',
  components: [
    {
      id: 'root',
      component: 'Page',
      title: '新建用户',
      children: ['card-form'],
    },
    {
      id: 'card-form',
      component: 'Card',
      title: '基本信息',
      children: ['vstack-fields', 'row-actions'],
    },
    {
      id: 'vstack-fields',
      component: 'VStack',
      gap: 'md',
      children: ['input-name', 'input-email', 'row-city-status', 'textarea-note'],
    },
    { id: 'input-name', component: 'Input', label: '姓名', placeholder: '请输入姓名', required: true },
    { id: 'input-email', component: 'Input', label: '邮箱', placeholder: '请输入邮箱', type: 'email', required: true },
    {
      id: 'row-city-status',
      component: 'Row',
      gap: 'md',
      children: ['sel-city', 'sel-status'],
    },
    {
      id: 'sel-city',
      component: 'Select',
      label: '城市', items: [{ value: 'bj', label: '北京' }, { value: 'sh', label: '上海' }, { value: 'gz', label: '广州' }],
    },
    {
      id: 'sel-status',
      component: 'Select',
      label: '状态', items: [{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }],
    },
    { id: 'textarea-note', component: 'Textarea', label: '备注', placeholder: '请输入备注', rows: 3 },
    {
      id: 'row-actions',
      component: 'Row',
      gap: 'md',
      justify: 'end',
      children: ['btn-cancel', 'btn-submit'],
    },
    { id: 'btn-cancel', component: 'Button', label: '取消', variant: 'ghost' },
    { id: 'btn-submit', component: 'Button', label: '提交', variant: 'primary' },
  ],
  },
}

// ── Data model samples ──────────────────────────────────────────

const CATALOG_ID = 'https://headless-ui.local/catalogs/a2ui/v0.1'

const DASHBOARD_DATA: A2UIUpdateDataModelMessage = {
  version: A2UI_VERSION,
  updateDataModel: {
    surfaceId: 'dashboard',
    value: {
      title: '运营看板',
      subtitle: '今日概览',
      statTitle1: '总用户',
      statValue1: 12850,
      statTitle2: '今日订单',
      statValue2: 462,
      tableCaption: '最近订单',
      alertMessage: '系统运行正常',
      alertDesc: '最后同步 3 分钟前',
    },
  },
}

const FORM_DATA: A2UIUpdateDataModelMessage = {
  version: A2UI_VERSION,
  updateDataModel: {
    surfaceId: 'form',
    value: {
      pageTitle: '新建用户',
      cardTitle: '基本信息',
    },
  },
}

const ATTENDANCE_SURFACE: A2UISurface = parseA2UIMessages(attendanceJsonl)

/** Wrap messages into a surface using the parser. */
function toSurface(
  msgs: (A2UIUpdateComponentsMessage | A2UIUpdateDataModelMessage)[],
  surfaceId: string,
): A2UISurface {
  return parseA2UIMessages([
    {
      version: A2UI_VERSION,
      createSurface: { surfaceId, catalogId: CATALOG_ID },
    },
    ...msgs,
  ] as import('../protocol/types').A2UIMessage[])
}

const SAMPLES: Record<string, A2UIUpdateComponentsMessage> = {
  dashboard: DASHBOARD_SAMPLE,
  form: FORM_SAMPLE,
}

const SAMPLE_DATA: Record<string, A2UIUpdateDataModelMessage> = {
  dashboard: DASHBOARD_DATA,
  form: FORM_DATA,
}

/** Left-drawer navigation — mirrors the production replica's sidebar. */
const DRAWER_NAV_ITEMS: HNavMenuItem[] = [
  {
    key: 'basic-info',
    label: '基础信息',
    icon: '▤',
    children: [
      { key: 'device-info', label: '设备信息', icon: '▤' },
      { key: 'person-list', label: '人员列表', icon: '◈' },
      { key: 'config-info', label: '配置信息', icon: '⚙' },
    ],
  },
  {
    key: 'operation-records',
    label: '运营记录',
    icon: '▣',
    children: [{ key: 'dispatch-management', label: '调度管理', icon: '◈' }],
  },
  {
    key: 'operation-management',
    label: '运营管理',
    icon: '▣',
    children: [{ key: 'operation-reports', label: '运营报表', icon: '▥' }],
  },
]

// ── Inline styles keyed by theme tokens ───────────────────────────
// Every colour references var(--ui-*) so the active theme drives everything.

const V = (name: string, fallback?: string): string =>
  `var(${name}${fallback ? `, ${fallback}` : ''})`

const S = {
  border:   `1px solid ${V('--ui-color-hairline')}`,
  borderSoft: `1px solid ${V('--ui-color-hairline-soft', V('--ui-color-hairline'))}`,
  primary:  V('--ui-color-primary'),
  text:     V('--ui-color-text'),
  textSec:  V('--ui-color-text-secondary'),
  muted:    V('--ui-color-muted'),
  surface:  V('--ui-color-surface'),
  surfaceMuted: V('--ui-color-surface-muted'),
  canvas:   V('--ui-color-canvas'),
  canvasSoft: V('--ui-color-canvas-soft', V('--ui-color-canvas')),
  sidebar:  V('--ui-color-sidebar', V('--ui-color-surface-muted')),
  sidebarHover: V('--ui-color-sidebar-hover'),
  controlBg: V('--ui-color-control-bg'),
  controlBorder: V('--ui-color-control-border'),
  font:     V('--ui-font-family'),
  radius:   V('--ui-radius-panel'),
  primarySoft: V('--ui-color-primary-soft'),
}

const PAGE_STYLE: Record<string, React.CSSProperties> = {
  container: { display: 'flex', height: '100vh', fontFamily: S.font },
  chatHeader: { padding: '12px 16px', borderBottom: S.border, fontSize: 14, fontWeight: 600 },
  messages: { flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 },
  inputArea: { padding: '12px', borderTop: S.border, display: 'flex', gap: 8 },
  input: { flex: 1, background: S.controlBg, border: `1px solid ${S.controlBorder}`, borderRadius: S.radius, padding: '8px 12px', color: S.text, fontSize: 13, outline: 'none' },
  sendBtn: { background: S.primary, color: 'white', border: 'none', borderRadius: S.radius, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  preview: { flex: 1, overflow: 'auto', padding: '24px', background: S.canvasSoft },
  sampleBar: { padding: '8px 12px', borderBottom: S.border, display: 'flex', gap: 8, flexWrap: 'wrap' },
  sampleBtn: { background: V('--ui-color-control-muted'), border: S.border, borderRadius: 6, color: S.textSec, padding: '4px 12px', cursor: 'pointer', fontSize: 12 },
  catalogBtn: { background: S.primarySoft, border: `1px solid ${V('--ui-color-primary-focus')}`, borderRadius: 6, color: S.primary, padding: '4px 12px', cursor: 'pointer', fontSize: 12 },
  badge: { background: 'red' } as React.CSSProperties,
}

// ── Chat message type ─────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

/** Messages kept for the LLM conversation (not the display-only chat summaries). */
interface LLMHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Keep the demo context bounded. The system prompt is sent separately. */
const MAX_LLM_CONTEXT_MESSAGES = 20

// ── Error boundary ──────────────────────────────────────────────

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, background: 'rgba(255,0,0,0.1)', borderRadius: 8, border: '1px solid rgba(255,0,0,0.3)' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 8px' }}>Render Error</h3>
          <pre style={{ fontSize: 12, color: '#fca5a5', whiteSpace: 'pre-wrap', margin: 0 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ fontSize: 11, color: '#999', whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {this.state.error.stack?.slice(0, 800)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

/** Pretty-print the component tree from the surface IR. */
function renderComponentTree(surface: A2UISurface, id?: string, indent = 0): string {
  const targetId = id ?? surface.rootId
  if (!targetId) return '(no root)'
  const node = surface.componentMap.get(targetId)
  if (!node) return `${'  '.repeat(indent)}⚠️ missing: ${targetId}`
  const prefix = '  '.repeat(indent)
  let out = `${prefix}${node.component} [${node.id}]`
  // show bound props
  const boundKeys: string[] = []
  const staticKeys: string[] = []
  for (const k of Object.keys(node)) {
    if (['id', 'component', 'children'].includes(k)) continue
    const v = (node as Record<string, unknown>)[k]
    if (typeof v === 'object' && v !== null && 'path' in v && typeof (v as {path: string}).path === 'string') {
      boundKeys.push(k)
    } else {
      staticKeys.push(k)
    }
  }
  if (boundKeys.length > 0) out += `  🔗 ${boundKeys.join(', ')}`
  if (staticKeys.length > 0 && staticKeys.length <= 6) {
    out += `  (${staticKeys.join(', ')})`
  } else if (staticKeys.length > 6) {
    out += `  (${staticKeys.slice(0, 5).join(', ')} +${staticKeys.length - 5})`
  }
  out += '\n'
  const children = node.children as string[] | undefined
  if (children && children.length > 0) {
    for (const childId of children) {
      out += renderComponentTree(surface, childId, indent + 1)
    }
  }
  return out
}

// ── Main app ──────────────────────────────────────────────────────

function App() {
  const [config, setConfig] = useState<LLMConfig>(loadConfig)
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '你好！配置 API Key 后即可对话生成页面。也可以直接选择上方示例预览。' },
  ])
  const [llmHistory, setLlmHistory] = useState<LLMHistoryMessage[]>([])
  const [surface, setSurface] = useState<A2UISurface>(
    () => ATTENDANCE_SURFACE,
  )
  const [rawJSONL, setRawJSONL] = useState<string>(attendanceJsonl)
  const [input, setInput] = useState('')
  const [showCatalog, setShowCatalog] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importJSONL, setImportJSONL] = useState('')
  const [importError, setImportError] = useState('')
  const [viewMode, setViewMode] = useState<'preview' | 'a2ui' | 'ir' | 'code'>('preview')
  const [chatOpen, setChatOpen] = useState(true)
  const [renderKey, setRenderKey] = useState(0)
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  /** Update surface and bump render key so A2UIRenderer remounts with fresh state. */
  function setSurfaceWithKey(next: A2UISurface) {
    setSurface(next)
    setRenderKey(k => k + 1)
  }

  /** Generate code on demand when user clicks "生成代码". */
  function handleGenerateCode() {
    setGeneratedCode(generateReactCode(surface))
    setViewMode('code')
  }

  function openImport() {
    setImportJSONL(rawJSONL)
    setImportError('')
    setShowImport(true)
  }

  function handleImportJSONL() {
    const source = importJSONL.trim()
    if (!source) {
      setImportError('请先粘贴 A2UI JSONL。')
      return
    }

    try {
      const next = parseA2UIMessages(source)
      setRawJSONL(source)
      setSurfaceWithKey(next)
      setViewMode('preview')
      setGeneratedCode('')
      setImportError('')
      setShowImport(false)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `✅ 已导入「${next.surfaceId}」页面（${next.components.length} 个组件）` },
      ])
    } catch (err) {
      setImportError(err instanceof A2UIParseError ? err.message : String(err))
    }
  }

  async function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || isGenerating) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsGenerating(true)

    // If no API key configured, use the old demo mode
    if (!config.apiKey) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `已收到：「${text}」\n\n目前为 demo 模式。点击右上角 ⚙ 配置 API Key 即可接入 LLM。`,
        },
      ])
      setIsGenerating(false)
      return
    }

    const systemPrompt = buildSystemPrompt()
    // Reserve one slot for the current user message. Keep the assistant's
    // raw A2UI JSONL, not the display-only summary shown in the chat panel.
    const previousMessages = llmHistory.slice(-(MAX_LLM_CONTEXT_MESSAGES - 1))
    const userMessage: LLMHistoryMessage = { role: 'user', content: text }
    const requestMessages: LLMHistoryMessage[] = [
      ...previousMessages,
      userMessage,
    ]
    setLlmHistory(prev => [...prev, userMessage].slice(-MAX_LLM_CONTEXT_MESSAGES))
    const startTime = Date.now()

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...requestMessages,
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text().catch(() => '')
        throw new Error(`${response.status} ${response.statusText}${errBody ? ` — ${errBody.slice(0, 300)}` : ''}`)
      }

      const data = await response.json()
      const rawContent: string = data.choices?.[0]?.message?.content ?? ''
      const jsonl = extractJSONL(rawContent)
      const assistantMessage: LLMHistoryMessage = { role: 'assistant', content: rawContent }
      setLlmHistory(prev => [...prev, assistantMessage].slice(-MAX_LLM_CONTEXT_MESSAGES))
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

      // Parse JSONL → surface
      let newSurface: A2UISurface
      try {
        newSurface = parseA2UIMessages(jsonl)
      } catch (parseErr) {
        const detail = parseErr instanceof A2UIParseError ? parseErr.message : String(parseErr)
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `❌ A2UI 解析失败：${detail}\n\nLLM 原始输出：\n\`\`\`\n${rawContent.slice(0, 2000)}\n\`\`\``,
          },
        ])
        setIsGenerating(false)
        return
      }

      setRawJSONL(jsonl)
      setSurfaceWithKey(newSurface)
      setViewMode('preview')
      setGeneratedCode('')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `✅ 已生成「${newSurface.surfaceId}」页面（${newSurface.components.length} 个组件，${elapsed}s）`,
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `❌ API 调用失败：${err instanceof Error ? err.message : String(err)}`,
        },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  function saveConfig(partial: Partial<LLMConfig>) {
    const next = { ...config, ...partial }
    setConfig(next)
    localStorage.setItem('a2ui-llm-config', JSON.stringify(next))
  }

  function loadSample(key: string) {
    const sample = SAMPLES[key]
    const data = SAMPLE_DATA[key]
    if (!sample) return
    const msgs: (A2UIUpdateComponentsMessage | A2UIUpdateDataModelMessage)[] = [sample]
    if (data) msgs.push(data)
    const newSurface = toSurface(msgs, key)
    setSurfaceWithKey(newSurface)
    setRawJSONL('')
    setViewMode('preview')
    setGeneratedCode('')
    setLlmHistory([])
    setMessages(prev => [
      ...prev,
      { role: 'user', text: `加载示例：${key}` },
      { role: 'assistant', text: `已渲染「${key}」示例。` },
    ])
  }

  const systemPrompt = showCatalog ? buildSystemPrompt() : null

  return (
    <div style={PAGE_STYLE.container}>
      {/* ── Chat panel — lives in a closable left drawer so the A2UI page gets full width ─ */}
      <HDrawer
        open={chatOpen}
        onOpenChange={({ open }) => setChatOpen(open)}
        placement="left"
        size="380px"
        title="A2UI 工具箱"
        description="浏览示例、导入 A2UI JSONL 或与 LLM 对话生成页面"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
          {/* Navigation — mirrors the production replica's sidebar */}
          <div className="a2ui-drawer-nav">
            <HNavMenu
              items={DRAWER_NAV_ITEMS}
              mode="inline"
              theme="dark"
              triggerSubMenuAction="click"
              defaultSelectedKeys={['device-info']}
              defaultOpenKeys={['basic-info', 'operation-records', 'operation-management']}
              className="a2ui-drawer-nav__menu"
            />
          </div>
          <div className="a2ui-drawer-divider" />

          <div style={{ ...PAGE_STYLE.chatHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>A2UI Demo</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setShowSettings(prev => !prev)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
                  color: S.textSec, padding: '2px 6px', borderRadius: 4,
                }}
                title="LLM 配置"
              >
                {showSettings ? '✕' : '⚙'}
              </button>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                  color: S.textSec, padding: '2px 6px', borderRadius: 4,
                }}
                title="收起面板"
              >
                ◀
              </button>
            </span>
          </div>
          {showSettings ? (
            <div style={{ padding: '12px', borderBottom: S.border, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: S.textSec, width: 60, flexShrink: 0 }}>API Key</span>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => saveConfig({ apiKey: e.target.value })}
                  placeholder="sk-..."
                  style={{ flex: 1, background: S.controlBg, border: `1px solid ${S.controlBorder}`, borderRadius: 4, padding: '4px 8px', color: S.text, fontSize: 12 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: S.textSec, width: 60, flexShrink: 0 }}>Base URL</span>
                <input
                  value={config.baseUrl}
                  onChange={e => saveConfig({ baseUrl: e.target.value })}
                  style={{ flex: 1, background: S.controlBg, border: `1px solid ${S.controlBorder}`, borderRadius: 4, padding: '4px 8px', color: S.text, fontSize: 12 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: S.textSec, width: 60, flexShrink: 0 }}>Model</span>
                <input
                  value={config.model}
                  onChange={e => saveConfig({ model: e.target.value })}
                  style={{ flex: 1, background: S.controlBg, border: `1px solid ${S.controlBorder}`, borderRadius: 4, padding: '4px 8px', color: S.text, fontSize: 12 }}
                />
              </div>
              <div style={{ color: S.muted, fontSize: 11, marginTop: 4 }}>
                配置保存在浏览器 localStorage，不会上传到任何服务器。
              </div>
            </div>
          ) : null}
          <div style={PAGE_STYLE.sampleBar}>
            {Object.keys(SAMPLES).map(key => (
              <button key={key} style={PAGE_STYLE.sampleBtn} onClick={() => loadSample(key)}>
                {key}
              </button>
            ))}
            <button
              style={PAGE_STYLE.catalogBtn}
              onClick={() => setShowCatalog(prev => !prev)}
            >
              {showCatalog ? '收起 Catalog' : '查看 Catalog'}
            </button>
            <button
              style={{
                ...PAGE_STYLE.catalogBtn,
                background: viewMode === 'a2ui' ? 'var(--ui-color-primary)' : PAGE_STYLE.catalogBtn.background,
                color: viewMode === 'a2ui' ? 'white' : PAGE_STYLE.catalogBtn.color,
              }}
              onClick={() => setViewMode(prev => prev === 'a2ui' ? 'preview' : 'a2ui')}
            >
              {viewMode === 'a2ui' ? '返回预览' : '查看 A2UI'}
            </button>
            <button
              style={{
                ...PAGE_STYLE.catalogBtn,
                background: viewMode === 'ir' ? 'var(--ui-color-primary)' : PAGE_STYLE.catalogBtn.background,
                color: viewMode === 'ir' ? 'white' : PAGE_STYLE.catalogBtn.color,
              }}
              onClick={() => setViewMode(prev => prev === 'ir' ? 'preview' : 'ir')}
            >
              {viewMode === 'ir' ? '返回预览' : '查看 IR'}
            </button>
            <button
              style={{
                ...PAGE_STYLE.catalogBtn,
                background: viewMode === 'code' ? 'var(--ui-color-primary)' : PAGE_STYLE.catalogBtn.background,
                color: viewMode === 'code' ? 'white' : PAGE_STYLE.catalogBtn.color,
              }}
              onClick={() => viewMode === 'code' ? setViewMode('preview') : handleGenerateCode()}
            >
              {viewMode === 'code' ? '返回预览' : '生成代码'}
            </button>
            <button
              style={{
                ...PAGE_STYLE.catalogBtn,
                background: showImport ? 'var(--ui-color-primary)' : PAGE_STYLE.catalogBtn.background,
                color: showImport ? 'white' : PAGE_STYLE.catalogBtn.color,
              }}
              onClick={() => openImport()}
            >
              导入 A2UI
            </button>
          </div>
          {showImport ? (
            <div style={{ padding: '10px 12px', borderBottom: S.border, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <HTextarea
                label="JSONL"
                value={importJSONL}
                rows={10}
                placeholder={'{"version":"v0.9.1","createSurface":{...}}'}
                onValueChange={({ value }) => setImportJSONL(value)}
              />
              {importError ? (
                <div style={{ color: '#ef4444', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {importError}
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="ui-button ui-button--secondary" type="button" onClick={() => setShowImport(false)}>
                  取消
                </button>
                <button className="ui-button ui-button--primary" type="button" onClick={handleImportJSONL}>
                  导入并预览
                </button>
              </div>
            </div>
          ) : null}
          <div style={PAGE_STYLE.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            ))}
            {showCatalog ? (
              <div style={{ marginTop: 8, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
                <pre style={{ fontSize: 11, whiteSpace: 'pre-wrap', color: '#aaa' }}>
                  {systemPrompt?.slice(0, 3000)}...
                </pre>
              </div>
            ) : null}
            <div ref={chatEndRef} />
          </div>
          <form style={PAGE_STYLE.inputArea} onSubmit={handleSend}>
            <input
              style={PAGE_STYLE.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={isGenerating ? '生成中...' : '描述你想要的页面...'}
              disabled={isGenerating}
            />
            <button type="submit" style={{ ...PAGE_STYLE.sendBtn, opacity: isGenerating ? 0.5 : 1 }} disabled={isGenerating}>
              {isGenerating ? '...' : '发送'}
            </button>
          </form>
        </div>
      </HDrawer>

      {/* ── Floating reopen trigger when the drawer is closed ── */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            position: 'fixed', top: 16, left: 16, zIndex: 60,
            width: 36, height: 36, borderRadius: 8,
            background: S.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          title="打开工具箱"
        >
          ☰
        </button>
      )}

      {/* ── Preview panel — full width so the A2UI page gets the stage ─ */}
      <div className="production-replica a2ui-production-preview" style={PAGE_STYLE.preview}>
        {viewMode === 'a2ui' ? (
          <div style={{ height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: S.text }}>
              A2UI v0.9.1 — {surface.surfaceId}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: S.textSec, marginBottom: 6 }}>
                这是 LLM 生成的原始 A2UI JSONL，解析后同时用于 runtime 预览和代码生成。
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {rawJSONL ? (
                  <span style={{ fontSize: 11, color: '#22c55e' }}>● 来自 LLM 实时生成</span>
                ) : (
                  <span style={{ fontSize: 11, color: S.textSec }}>● 示例数据</span>
                )}
                <span style={{ fontSize: 11, color: S.textSec }}>
                  {surface.components.length} 组件
                </span>
              </div>
            </div>
            <pre style={{
              fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              background: 'rgba(0,0,0,0.3)', color: '#e0e0e0',
              padding: 16, borderRadius: 8, maxHeight: 'calc(100vh - 180px)',
              overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            }}>
              {rawJSONL || JSON.stringify(surface.components.map(c => ({
                id: c.id,
                component: c.component,
                ...Object.fromEntries(
                  Object.entries(c).filter(([k]) => !['id', 'component', 'children'].includes(k))
                ),
                ...(c.children ? { children: c.children } : {}),
              })), null, 2)}
            </pre>
          </div>
        ) : viewMode === 'ir' ? (
          <div style={{ height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: S.text }}>
              A2UISurface IR — {surface.surfaceId}
            </div>
            <div style={{ fontSize: 11, color: S.textSec, marginBottom: 16 }}>
              这是 parseA2UIMessages() 解析后的中间表示（A2UISurface），包含 componentMap、dataModel、rootId。运行时渲染和代码生成都基于此 IR。
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: S.text, marginBottom: 8 }}>
                📌 surfaceId: <span style={{ color: '#a78bfa' }}>{surface.surfaceId}</span>
                {' · '}rootId: <span style={{ color: '#22c55e' }}>{surface.rootId}</span>
                {' · '}{surface.components.length} 组件
              </div>
            </div>

            <details open style={{ marginBottom: 16 }}>
              <summary style={{ fontSize: 12, fontWeight: 600, color: S.text, cursor: 'pointer', marginBottom: 8 }}>
                📦 componentMap ({surface.components.length} entries)
              </summary>
              <pre style={{
                fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.3)', color: '#e0e0e0',
                padding: 16, borderRadius: 8, maxHeight: 400,
                overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              }}>
                {JSON.stringify(
                  Object.fromEntries(
                    surface.components.map(c => [c.id, {
                      component: c.component,
                      ...Object.fromEntries(
                        Object.entries(c).filter(([k]) => !['id', 'component'].includes(k))
                      ),
                    }])
                  ),
                  null, 2
                )}
              </pre>
            </details>

            <details open style={{ marginBottom: 16 }}>
              <summary style={{ fontSize: 12, fontWeight: 600, color: S.text, cursor: 'pointer', marginBottom: 8 }}>
                📊 dataModel
              </summary>
              <pre style={{
                fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.3)', color: '#e0e0e0',
                padding: 16, borderRadius: 8, maxHeight: 400,
                overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              }}>
                {JSON.stringify(surface.dataModel, null, 2)}
              </pre>
            </details>

            <details style={{ marginBottom: 16 }}>
              <summary style={{ fontSize: 12, fontWeight: 600, color: S.text, cursor: 'pointer', marginBottom: 8 }}>
                👁️ 组件树（缩进结构）
              </summary>
              <pre style={{
                fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.3)', color: '#e0e0e0',
                padding: 16, borderRadius: 8, maxHeight: 400,
                overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              }}>
                {renderComponentTree(surface)}
              </pre>
            </details>
          </div>
        ) : viewMode === 'code' ? (
          <div style={{ height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: S.text }}>
              Generated React code — {surface.surfaceId}.tsx
            </div>
            <div style={{ fontSize: 11, color: S.textSec, marginBottom: 8 }}>
              此代码由 generateReactCode(surface) 生成，与左侧 A2UI JSON 同源，保证 1:1 对应。
            </div>
            <pre style={{
              fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
              background: 'rgba(0,0,0,0.3)', color: '#e0e0e0',
              padding: 16, borderRadius: 8, maxHeight: 'calc(100vh - 140px)',
              overflow: 'auto', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            }}>
              {generatedCode}
            </pre>
          </div>
        ) : (
          <ErrorBoundary>
            <A2UIRenderer key={renderKey} surface={surface} />
          </ErrorBoundary>
        )}
      </div>

    </div>
  )
}

// ── Mount ─────────────────────────────────────────────────────────

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
