import type { ComponentCatalog } from './types'

/**
 * A2UI component catalog generated from core contracts.
 *
 * This is the single source of truth for what the LLM knows about:
 *   - component name (A2UI `"component"` field)
 *   - props the component accepts
 *   - a compact JSON example the LLM can use as a template
 *
 * Adding a new entry here automatically feeds both:
 *   1. `prompt-builder.ts` — the SYSTEM_PROMPT sent to the LLM
 *   2. `renderer.tsx`   — the A2UI adjacency list → H* component mapping
 */

export const catalog: ComponentCatalog = [
  // ── Layout ────────────────────────────────────────────────────
  {
    name: 'Page',
    label: '页面',
    contract: 'LayoutContract',
    description: '顶级页面容器，子组件垂直排列。title 显示页面标题。',
    props: [
      { name: 'title', type: 'string', required: false, description: '页面标题' },
      { name: 'subtitle', type: 'string', required: false, description: '副标题' },
    ],
    example: { component: 'Page', id: 'page', title: '用户管理', children: ['row1', 'table1'] },
  },
  {
    name: 'Row',
    label: '横向布局',
    contract: 'LayoutContract',
    description: '横向弹性布局容器。子组件等分可用宽度，可设 gap。',
    props: [
      { name: 'gap', type: '"xs" | "sm" | "md" | "lg" | "xl"', required: false, description: '子项间距，默认 sm' },
      { name: 'align', type: '"start" | "center" | "end" | "stretch"', required: false, description: '垂直对齐方式' },
    ],
    example: { component: 'Row', id: 'row1', gap: 'md', children: ['col1', 'col2'] },
  },
  {
    name: 'Col',
    label: '列',
    contract: 'LayoutContract',
    description: 'Row 的列子项。span 控制宽度比例（类似 12 列栅格）。',
    props: [
      { name: 'span', type: 'number', required: false, description: '宽度比例，默认 1（均分）' },
    ],
    example: { component: 'Col', id: 'col1', span: 2, children: ['card1'] },
  },
  {
    name: 'VStack',
    label: '垂直堆叠',
    contract: 'LayoutContract',
    description: '垂直方向弹性布局容器。子组件依次向下排列。',
    props: [
      { name: 'gap', type: '"xs" | "sm" | "md" | "lg" | "xl"', required: false, description: '子项间距，默认 md' },
      { name: 'align', type: '"start" | "center" | "end" | "stretch"', required: false, description: '水平对齐方式' },
    ],
    example: { component: 'VStack', id: 'vstack1', gap: 'md', children: ['card1', 'card2'] },
  },

  // ── Data display ───────────────────────────────────────────────
  {
    name: 'Card',
    label: '卡片',
    contract: 'CardContract',
    description: '内容容器，有标题和边框。用 children 放内容。',
    props: [
      { name: 'title', type: 'string', required: false, description: '卡片标题' },
      { name: 'extra', type: 'string', required: false, description: '右上角额外文字' },
    ],
    example: { component: 'Card', id: 'card1', title: '基本信息', children: ['content1'] },
  },
  {
    name: 'StatCard',
    label: '统计卡片',
    contract: 'CardContract',
    description: '展示单个统计指标 —— 标题 + 数值 + 趋势箭头。',
    props: [
      { name: 'title', type: 'string', required: true, description: '指标名称' },
      { name: 'value', type: 'string | number', required: true, description: '指标值' },
      { name: 'color', type: 'string', required: false, description: '数值颜色（hex）, 默认 #6366f1' },
      { name: 'trend', type: '"up" | "down"', required: false, description: '趋势方向' },
      { name: 'trendValue', type: 'string', required: false, description: '趋势变化百分比' },
    ],
    example: { component: 'StatCard', id: 'stat1', title: '总用户数', value: 12580, color: '#6366f1', trend: 'up', trendValue: '12%' },
  },
  {
    name: 'Badge',
    label: '徽标',
    contract: 'BadgeContract',
    description: '圆角徽标，展示计数或状态。',
    props: [
      { name: 'text', type: 'string', required: true, description: '徽标文字' },
      { name: 'tone', type: '"neutral" | "info" | "success" | "warning" | "danger"', required: false, description: '色调' },
    ],
    example: { component: 'Badge', id: 'badge1', text: '已启用', tone: 'success' },
  },
  {
    name: 'Tag',
    label: '标签',
    contract: 'TagContract',
    description: '内联标签，用于标记/分类。',
    props: [
      { name: 'content', type: 'string', required: true, description: '标签文字' },
      { name: 'tone', type: '"neutral" | "info" | "success" | "warning"', required: false, description: '色调' },
    ],
    example: { component: 'Tag', id: 'tag1', content: '管理', tone: 'info' },
  },
  {
    name: 'Progress',
    label: '进度条',
    contract: 'ProgressContract',
    description: '展示 0–100 的进度。',
    props: [
      { name: 'value', type: 'number', required: true, description: '当前进度 (0–100)' },
      { name: 'color', type: 'string', required: false, description: '进度条颜色' },
    ],
    example: { component: 'Progress', id: 'prog1', value: 68, color: '#6366f1' },
  },
  {
    name: 'Separator',
    label: '分割线',
    contract: 'SeparatorContract',
    description: '视觉分割线。',
    props: [
      { name: 'label', type: 'string', required: false, description: '分割线中间的文字' },
    ],
    example: { component: 'Separator', id: 'sep1', label: '基本信息' },
  },
  {
    name: 'Text',
    label: '文本',
    contract: 'shared',
    description: '纯文本块。',
    props: [
      { name: 'content', type: 'string', required: true, description: '文本内容' },
      { name: 'strong', type: 'boolean', required: false, description: '是否加粗' },
    ],
    example: { component: 'Text', id: 'text1', content: '这是一段说明文字', strong: false },
  },

  // ── Form inputs ─────────────────────────────────────────────────
  {
    name: 'Input',
    label: '输入框',
    contract: 'InputContract',
    description: '单行文本输入。通过 value + onValueChange 实现受控。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'placeholder', type: 'string', required: false, description: '占位文字' },
      { name: 'value', type: 'string', required: false, description: '受控值（绑定 data model 时不需要）' },
      { name: 'defaultValue', type: 'string', required: false, description: '默认值' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
      { name: 'readOnly', type: 'boolean', required: false, description: '只读' },
      { name: 'required', type: 'boolean', required: false, description: '必填' },
      { name: 'type', type: '"text" | "email" | "password" | "tel" | "url" | "search"', required: false, description: '语义类型' },
    ],
    example: { component: 'Input', id: 'input1', label: '姓名', placeholder: '请输入', required: true },
  },
  {
    name: 'NumberInput',
    label: '数字输入',
    contract: 'NumberInputContract',
    description: '数字输入框，带增减按钮。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'min', type: 'number', required: false, description: '最小值' },
      { name: 'max', type: 'number', required: false, description: '最大值' },
      { name: 'step', type: 'number', required: false, description: '步进值' },
      { name: 'value', type: 'string | number', required: false, description: '受控值' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
      { name: 'required', type: 'boolean', required: false, description: '必填' },
    ],
    example: { component: 'NumberInput', id: 'num1', label: '年龄', min: 0, max: 150, step: 1 },
  },
  {
    name: 'Textarea',
    label: '多行文本',
    contract: 'TextareaContract',
    description: '多行文本域。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'placeholder', type: 'string', required: false, description: '占位文字' },
      { name: 'rows', type: 'number', required: false, description: '行数' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
      { name: 'required', type: 'boolean', required: false, description: '必填' },
    ],
    example: { component: 'Textarea', id: 'textarea1', label: '备注', placeholder: '请输入', rows: 4 },
  },
  {
    name: 'Select',
    label: '下拉选择',
    contract: 'SelectContract',
    description: '单值下拉选择器。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'placeholder', type: 'string', required: false, description: '占位文字' },
      { name: 'items', type: '{value:string|number,label:string}[]', required: true, description: '选项列表' },
      { name: 'value', type: 'string | number', required: false, description: '当前选中值' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
    ],
    example: { component: 'Select', id: 'sel1', label: '状态', items: [{ value: 'active', label: '启用' }, { value: 'inactive', label: '停用' }] },
  },
  {
    name: 'Checkbox',
    label: '复选框',
    contract: 'CheckboxContract',
    description: '单选框。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'checked', type: 'boolean', required: false, description: '选中状态' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
    ],
    example: { component: 'Checkbox', id: 'cb1', label: '我已阅读并同意', checked: false },
  },
  {
    name: 'Toggle',
    label: '开关',
    contract: 'ToggleContract',
    description: '开关切换。',
    props: [
      { name: 'checked', type: 'boolean', required: false, description: '开关状态' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
    ],
    example: { component: 'Toggle', id: 'tog1', checked: true },
  },
  {
    name: 'DatePicker',
    label: '日期选择',
    contract: 'DatePickerContract',
    description: '日期选择器。',
    props: [
      { name: 'label', type: 'string', required: false, description: '标签' },
      { name: 'value', type: 'string', required: false, description: 'ISO 日期字符串 YYYY-MM-DD' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
      { name: 'required', type: 'boolean', required: false, description: '必填' },
    ],
    example: { component: 'DatePicker', id: 'dp1', label: '日期', value: '2026-07-30' },
  },

  // ── Action ──────────────────────────────────────────────────────
  {
    name: 'Button',
    label: '按钮',
    contract: 'ButtonContract',
    description: '操作按钮。可有 primary（强号召）、secondary（次要）、ghost（透明）三种 variant。',
    props: [
      { name: 'label', type: 'string', required: true, description: '按钮文字' },
      { name: 'variant', type: '"primary" | "secondary" | "ghost"', required: false, description: '视觉权重' },
      { name: 'size', type: '"sm" | "md" | "lg"', required: false, description: '尺寸' },
      { name: 'disabled', type: 'boolean', required: false, description: '禁用' },
      { name: 'danger', type: 'boolean', required: false, description: '危险操作模式（红色）' },
    ],
    example: { component: 'Button', id: 'btn1', label: '提交', variant: 'primary' },
  },
  {
    name: 'ButtonGroup',
    label: '按钮组',
    contract: 'ButtonContract',
    description: '并排按钮组合。',
    props: [
      { name: 'buttons', type: '{label:string, variant?:"primary"|"secondary"|"ghost", danger?:boolean}[]', required: true, description: '按钮列表' },
    ],
    example: { component: 'ButtonGroup', id: 'btns1', buttons: [{ label: '确认', variant: 'primary' }, { label: '取消', variant: 'ghost' }] },
  },

  // ── Complex ──────────────────────────────────────────────────────
  {
    name: 'Table',
    label: '表格',
    contract: 'TableContract',
    description: '数据表格 —— 支持排序、分页、行展开。columns 定义列 (accessorKey + header)，dataSource 是行数据数组。',
    props: [
      { name: 'columns', type: '{accessorKey:string, header:string, cellType?:"text"|"tag"|"badge"}[]', required: true, description: '列定义' },
      { name: 'dataSource', type: 'Record<string,any>[]', required: true, description: '行数据' },
      { name: 'enableSorting', type: 'boolean', required: false, description: '启用列排序，默认 true' },
      { name: 'enablePagination', type: 'boolean', required: false, description: '启用分页，默认 false' },
      { name: 'pageSize', type: 'number', required: false, description: '每页行数，默认 10' },
      { name: 'density', type: '"compact" | "comfortable"', required: false, description: '密度' },
      { name: 'caption', type: 'string', required: false, description: '表格标题' },
    ],
    example: {
      component: 'Table', id: 'table1',
      columns: [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: '姓名' },
        { accessorKey: 'status', header: '状态', cellType: 'badge' },
      ],
      dataSource: [
        { id: 1, name: '张三', status: '正常' },
        { id: 2, name: '李四', status: '禁用' },
      ],
      enablePagination: true,
    },
  },
  {
    name: 'Chart',
    label: '图表',
    contract: 'ChartContract',
    description: 'ECharts 图表 —— 支持 line、bar、pie、area、gauge、scatter。用 data 传 {name, value} 数组（饼图/单系列），或 series 传多系列。',
    props: [
      { name: 'title', type: 'string', required: false, description: '图表标题' },
      { name: 'type', type: '"line" | "bar" | "pie" | "area"', required: true, description: '图表类型' },
      { name: 'data', type: '{name:string, value:number}[]', required: false, description: '图表数据（name=类别名, value=数值）。饼图和单系列折线/柱状图用这个' },
      { name: 'categories', type: 'string[]', required: false, description: 'X 轴类目标签（cartesian 图表）。若未提供，自动从 data[].name 提取' },
      { name: 'series', type: '{name:string, data:number[]}[]', required: false, description: '多系列数据（高级用法）。每个系列有 name 和 data 数组' },
      { name: 'height', type: 'number', required: false, description: '图表高度 (px)，默认 320' },
      { name: 'legend', type: 'boolean', required: false, description: '是否显示图例，默认多系列时自动' },
      { name: 'smooth', type: 'boolean', required: false, description: '平滑曲线，默认 false' },
      { name: 'stack', type: 'boolean', required: false, description: '堆积显示，默认 false' },
      { name: 'unit', type: 'string', required: false, description: 'Y 轴单位后缀，如 "%"' },
    ],
    example: {
      component: 'Chart', id: 'chart1',
      title: '月度趋势', type: 'line',
      data: [{ name: '1月', value: 100 }, { name: '2月', value: 200 }, { name: '3月', value: 150 }],
      height: 300,
    },
  },
  {
    name: 'Tabs',
    label: '标签页',
    contract: 'TabsContract',
    description: '选项卡切换。每个 tab 的 content 是 children 中的组件 ID。',
    props: [
      { name: 'items', type: '{value:string, label:string, content:string}[]', required: true, description: '标签列表；content 是子组件 ID' },
    ],
    example: { component: 'Tabs', id: 'tabs1', items: [{ value: 'overview', label: '概览', content: 'card1' }, { value: 'detail', label: '详情', content: 'card2' }] },
  },

  // ── Feedback ────────────────────────────────────────────────────
  {
    name: 'Alert',
    label: '提示',
    contract: 'shared',
    description: '信息提示条 —— 成功/警告/错误/信息。',
    props: [
      { name: 'type', type: '"info" | "success" | "warning" | "error"', required: false, description: '提示类型' },
      { name: 'message', type: 'string', required: true, description: '提示标题' },
      { name: 'description', type: 'string', required: false, description: '详细描述' },
    ],
    example: { component: 'Alert', id: 'alert1', type: 'info', message: '系统运行正常', description: '最后同步 10 分钟前' },
  },
  {
    name: 'Dialog',
    label: '弹窗',
    contract: 'DialogContract',
    description: '模态对话框。',
    props: [
      { name: 'title', type: 'string', required: true, description: '弹窗标题' },
      { name: 'description', type: 'string', required: false, description: '弹窗描述' },
      { name: 'open', type: 'boolean', required: false, description: '受控打开状态' },
    ],
    example: { component: 'Dialog', id: 'dialog1', title: '确认删除', description: '此操作不可撤销', children: ['text1'] },
  },

  // ── Navigation ───────────────────────────────────────────────────
  {
    name: 'NavMenu',
    label: '导航菜单',
    contract: 'NavMenuContract',
    description: '左侧导航菜单 —— 支持多级展开、选中高亮。',
    props: [
      { name: 'items', type: '{value:string, label:string, icon?:string, children?}[]', required: true, description: '菜单项（支持多级嵌套）' },
      { name: 'selectedKeys', type: 'string[]', required: false, description: '当前选中的 value' },
    ],
    example: { component: 'NavMenu', id: 'nav1', items: [{ value: 'home', label: '首页' }, { value: 'settings', label: '设置', children: [{ value: 'profile', label: '个人信息' }] }] },
  },
]

/** Look up a catalog entry by component name. */
export function getCatalogEntry(name: string) {
  return catalog.find(e => e.name === name)
}
