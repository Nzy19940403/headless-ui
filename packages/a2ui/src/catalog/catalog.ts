import type { CatalogPropDef, ComponentCatalog } from './types'

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

const baseCatalog: ComponentCatalog = [
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
    description: '横向布局容器。默认 flex 等分；设 split 后变为侧栏布局（固定侧栏 + 弹性内容，侧栏自动撑满高度）。',
    props: [
      { name: 'gap', type: '"xs" | "sm" | "md" | "lg" | "xl"', required: false, description: '子项间距，默认 sm' },
      { name: 'align', type: '"start" | "center" | "end" | "stretch"', required: false, description: '垂直对齐方式' },
      { name: 'split', type: '"left" | "right"', required: false, description: '设为侧栏布局：第一个（left）或第二个（right）子项作为固定宽度侧栏' },
      { name: 'sidebarWidth', type: 'number', required: false, description: 'split 模式侧栏宽度 (px)，默认 190' },
      { name: 'collapsedWidth', type: 'number', required: false, description: 'split 模式侧栏折叠（☰）时宽度 (px)，默认 64' },
      { name: 'className', type: 'string', required: false, description: '自定义类名，用于页面级样式标记（如 "a2ui-filters" 筛选行、"a2ui-pagination" 分页行）' },
    ],
    example: { component: 'Row', id: 'row1', gap: 'md', children: ['col1', 'col2'] },
  },
  {
    name: 'Col',
    label: '列',
    contract: 'LayoutContract',
    description: 'Row 的列子项。span 控制宽度比例（类似 12 列栅格）。宽度由父布局决定：普通 Row 按 span 弹性，split Row 由 HSplit 的侧栏宽度控制。',
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
  {
    name: 'Header',
    label: '顶栏',
    contract: 'LayoutContract',
    description: '页面顶部导航栏 —— 品牌标识、主导航项、用户区。通常放在 Page 的第一个子组件。',
    props: [
      { name: 'brand', type: 'string', required: false, description: '品牌名称' },
      { name: 'logo', type: 'string', required: false, description: '品牌 logo 图片 URL' },
      { name: 'navItems', type: '{key:string,label:string}[]', required: false, description: '主导航项（key + 显示文字）' },
      { name: 'navActive', type: 'string', required: false, description: '当前激活的导航项 key' },
      { name: 'project', type: 'string', required: false, description: '项目选择区文字（如 "蒙兴煤矿"）' },
      { name: 'welcome', type: 'string', required: false, description: '欢迎语' },
      { name: 'mark', type: 'string', required: false, description: '头像标记文字' },
    ],
    example: {
      component: 'Header', id: 'header1',
      brand: '数字矿山', logo: '/production-assets/icon.png',
      navItems: [{ key: 'live', label: '实时动态' }, { key: 'ops', label: '生产运营' }],
      navActive: 'ops', project: '蒙兴煤矿', welcome: '欢迎用户·曹冬燕', mark: 'A☆',
    },
  },
  {
    name: 'Image',
    label: '图片',
    contract: 'shared',
    description: '内联图片，常用于品牌 logo 或图标。',
    props: [
      { name: 'src', type: 'string', required: true, description: '图片 URL' },
      { name: 'alt', type: 'string', required: false, description: '替代文字' },
      { name: 'width', type: 'number', required: false, description: '宽度 (px)' },
      { name: 'height', type: 'number', required: false, description: '高度 (px)' },
    ],
    example: { component: 'Image', id: 'img1', src: '/production-assets/icon.png', alt: 'logo', width: 32, height: 32 },
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
      { name: 'rowDraggable', type: 'boolean', required: false, description: '启用拖拽行排序，默认 false' },
      { name: 'rowOrder', type: 'string[]', required: false, description: '受控行顺序（行 id 数组，按显示顺序）' },
      { name: 'defaultRowOrder', type: 'string[]', required: false, description: '非受控模式的初始行顺序' },
      { name: 'onRowOrderChange', type: '{rowOrder:string[]} => void', required: false, description: '行顺序变化回调' },
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

/**
 * Props that are already supported by the core/react contracts but were not
 * part of the original hand-written A2UI catalog. Keep this layer separate
 * so the catalog examples and descriptions remain readable while capability
 * coverage can be audited in one place.
 */
const CONTRACT_PROP_SUPPLEMENTS: Record<string, CatalogPropDef[]> = {
  Card: [
    { name: 'description', type: 'string', required: false, description: 'Secondary card description.' },
    { name: 'variant', type: '"surface" | "outline" | "ghost"', required: false, description: 'Card visual variant.' },
  ],
  Badge: [
    { name: 'dot', type: 'boolean', required: false, description: 'Show the status dot.' },
  ],
  Tag: [
    { name: 'size', type: '"sm" | "md" | "lg"', required: false, description: 'Tag size.' },
  ],
  Progress: [
    { name: 'min', type: 'number', required: false, description: 'Minimum progress value.' },
    { name: 'max', type: 'number', required: false, description: 'Maximum progress value.' },
    { name: 'label', type: 'string', required: false, description: 'Progress label.' },
    { name: 'indeterminate', type: 'boolean', required: false, description: 'Show indeterminate progress.' },
  ],
  Separator: [
    { name: 'orientation', type: '"horizontal" | "vertical"', required: false, description: 'Separator orientation.' },
  ],
  Input: [
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the input.' },
    { name: 'size', type: '"sm" | "md" | "lg"', required: false, description: 'Input size.' },
    { name: 'name', type: 'string', required: false, description: 'Form field name.' },
  ],
  NumberInput: [
    { name: 'defaultValue', type: 'string | number', required: false, description: 'Initial numeric value.' },
    { name: 'readOnly', type: 'boolean', required: false, description: 'Make the field read-only.' },
    { name: 'name', type: 'string', required: false, description: 'Form field name.' },
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the input.' },
    { name: 'formatOptions', type: 'object', required: false, description: 'Number formatting options.' },
    { name: 'allowMouseWheel', type: 'boolean', required: false, description: 'Allow mouse-wheel changes.' },
    { name: 'scrubber', type: 'boolean', required: false, description: 'Show the drag scrubber.' },
  ],
  Textarea: [
    { name: 'value', type: 'string', required: false, description: 'Controlled value.' },
    { name: 'defaultValue', type: 'string', required: false, description: 'Initial value.' },
    { name: 'readOnly', type: 'boolean', required: false, description: 'Make the field read-only.' },
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the textarea.' },
    { name: 'name', type: 'string', required: false, description: 'Form field name.' },
    { name: 'size', type: '"sm" | "md" | "lg"', required: false, description: 'Textarea size.' },
  ],
  Select: [
    { name: 'defaultValue', type: 'string | number', required: false, description: 'Initial selected value.' },
    { name: 'name', type: 'string', required: false, description: 'Form field name.' },
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the select.' },
  ],
  Checkbox: [
    { name: 'defaultChecked', type: 'boolean', required: false, description: 'Initial checked state.' },
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the checkbox.' },
  ],
  Toggle: [
    { name: 'defaultChecked', type: 'boolean', required: false, description: 'Initial checked state.' },
    { name: 'error', type: 'string', required: false, description: 'Validation error message.' },
    { name: 'helperText', type: 'string', required: false, description: 'Helper text below the toggle.' },
  ],
  DatePicker: [
    { name: 'id', type: 'string', required: false, description: 'Input id.' },
    { name: 'name', type: 'string', required: false, description: 'Form field name.' },
    { name: 'placeholder', type: 'string', required: false, description: 'Placeholder text.' },
    { name: 'defaultValue', type: 'string[]', required: false, description: 'Initial date value.' },
    { name: 'open', type: 'boolean', required: false, description: 'Controlled open state.' },
    { name: 'defaultOpen', type: 'boolean', required: false, description: 'Initial open state.' },
    { name: 'readOnly', type: 'boolean', required: false, description: 'Make the picker read-only.' },
    { name: 'invalid', type: 'boolean', required: false, description: 'Show invalid state.' },
    { name: 'min', type: 'string', required: false, description: 'Minimum ISO date.' },
    { name: 'max', type: 'string', required: false, description: 'Maximum ISO date.' },
    { name: 'locale', type: 'string', required: false, description: 'Locale.' },
    { name: 'timeZone', type: 'string', required: false, description: 'Time zone.' },
    { name: 'selectionMode', type: '"single" | "multiple" | "range"', required: false, description: 'Date selection mode.' },
    { name: 'maxSelectedDates', type: 'number', required: false, description: 'Maximum selected dates.' },
    { name: 'view', type: '"day" | "month" | "year"', required: false, description: 'Visible calendar view.' },
    { name: 'defaultView', type: '"day" | "month" | "year"', required: false, description: 'Initial calendar view.' },
    { name: 'minView', type: '"day" | "month" | "year"', required: false, description: 'Minimum calendar view.' },
    { name: 'maxView', type: '"day" | "month" | "year"', required: false, description: 'Maximum calendar view.' },
    { name: 'numOfMonths', type: 'number', required: false, description: 'Number of visible months.' },
    { name: 'startOfWeek', type: 'number', required: false, description: 'First day of week, 0-6.' },
    { name: 'fixedWeeks', type: 'boolean', required: false, description: 'Use fixed week rows.' },
    { name: 'showWeekNumbers', type: 'boolean', required: false, description: 'Show week numbers.' },
    { name: 'outsideDaySelectable', type: 'boolean', required: false, description: 'Allow selecting outside days.' },
    { name: 'closeOnSelect', type: 'boolean', required: false, description: 'Close after selecting.' },
    { name: 'openOnClick', type: 'boolean', required: false, description: 'Open on input click.' },
    { name: 'inline', type: 'boolean', required: false, description: 'Render inline instead of popover.' },
    { name: 'positioning', type: '"top" | "bottom" | "left" | "right"', required: false, description: 'Popover placement.' },
  ],
  Tabs: [
    { name: 'value', type: 'string', required: false, description: 'Controlled active tab.' },
    { name: 'defaultValue', type: 'string', required: false, description: 'Initial active tab.' },
  ],
  Dialog: [
    { name: 'defaultOpen', type: 'boolean', required: false, description: 'Initial open state.' },
    { name: 'lazyMount', type: 'boolean', required: false, description: 'Mount content lazily.' },
    { name: 'unmountOnExit', type: 'boolean', required: false, description: 'Unmount content when closed.' },
    { name: 'skipAnimationOnMount', type: 'boolean', required: false, description: 'Skip initial animation.' },
  ],
  NavMenu: [
    { name: 'mode', type: '"vertical" | "horizontal" | "inline"', required: false, description: 'Menu layout mode.' },
    { name: 'theme', type: '"light" | "dark"', required: false, description: 'Menu theme.' },
    { name: 'selectable', type: 'boolean', required: false, description: 'Allow selection.' },
    { name: 'multiple', type: 'boolean', required: false, description: 'Allow multiple selection.' },
    { name: 'inlineCollapsed', type: 'boolean', required: false, description: 'Collapse inline menu.' },
    { name: 'inlineIndent', type: 'number', required: false, description: 'Nested indentation.' },
    { name: 'defaultSelectedKeys', type: 'string[]', required: false, description: 'Initial selected keys.' },
    { name: 'openKeys', type: 'string[]', required: false, description: 'Controlled open keys.' },
    { name: 'defaultOpenKeys', type: 'string[]', required: false, description: 'Initial open keys.' },
    { name: 'triggerSubMenuAction', type: '"hover" | "click"', required: false, description: 'Submenu trigger.' },
  ],
  Chart: [
    { name: 'loading', type: 'boolean', required: false, description: 'Show loading state.' },
    { name: 'emptyText', type: 'string', required: false, description: 'Empty chart text.' },
  ],
  Table: [
    { name: 'fillHeight', type: 'boolean', required: false, description: 'Fill available block size.' },
    { name: 'sorting', type: '{id:string, desc:boolean}[]', required: false, description: 'Controlled sorting state.' },
    { name: 'defaultSorting', type: '{id:string, desc:boolean}[]', required: false, description: 'Initial sorting state.' },
    { name: 'pagination', type: '{pageIndex:number, pageSize:number}', required: false, description: 'Controlled pagination state.' },
    { name: 'defaultPagination', type: '{pageIndex:number, pageSize:number}', required: false, description: 'Initial pagination state.' },
    { name: 'resizeable', type: 'boolean', required: false, description: 'Enable column resizing.' },
    { name: 'enableColumnResizing', type: 'boolean', required: false, description: 'Compatibility alias for column resizing.' },
    { name: 'columnResizeMode', type: '"onChange" | "onEnd"', required: false, description: 'When resizing state updates.' },
    { name: 'columnSizing', type: 'Record<string, number>', required: false, description: 'Controlled column widths.' },
    { name: 'defaultColumnSizing', type: 'Record<string, number>', required: false, description: 'Initial column widths.' },
    { name: 'draggable', type: 'boolean', required: false, description: 'Enable header drag-and-drop column ordering.' },
    { name: 'enableColumnOrdering', type: 'boolean', required: false, description: 'Compatibility alias for column ordering.' },
    { name: 'columnOrder', type: 'string[]', required: false, description: 'Controlled column order.' },
    { name: 'defaultColumnOrder', type: 'string[]', required: false, description: 'Initial column order.' },
    { name: 'enableExpanding', type: 'boolean', required: false, description: 'Enable expandable rows.' },
    { name: 'expanded', type: 'boolean | Record<string, boolean>', required: false, description: 'Controlled expanded rows.' },
    { name: 'defaultExpanded', type: 'boolean | Record<string, boolean>', required: false, description: 'Initial expanded rows.' },
    { name: 'detailFields', type: '{key:string,label:string}[]', required: false, description: 'When enableExpanding is on, fields shown in each row’s expanded detail grid (key = column accessorKey).' },
    { name: 'padEmptyRows', type: 'boolean', required: false, description: 'Pad paginated tables to stable height.' },
    { name: 'externalPagination', type: 'boolean', required: false, description: 'Set true when a custom pagination row is provided as the table’s children — suppresses HTable’s built-in pagination.' },
    { name: 'textAlign', type: '"left" | "center" | "right"', required: false, description: 'Default cell text alignment.' },
    { name: 'emptyText', type: 'string', required: false, description: 'Empty table text.' },
    { name: 'loading', type: 'boolean', required: false, description: 'Show table loading state.' },
  ],
}

const prop = (name: string, type: string, required = false): CatalogPropDef => ({
  name,
  type,
  required,
  description: `Supported ${name} capability.`,
})

/** Components already exported by @demo/ui-react but not in the original catalog. */
const additionalCatalog: ComponentCatalog = [
  {
    name: 'Accordion', label: 'Accordion', contract: 'AccordionContract',
    description: 'Disclosure sections with one or multiple expanded items.',
    props: [prop('items', '{value:string,label:string,content:string}[]', true), prop('multiple', 'boolean'), prop('defaultValue', 'string[]'), prop('value', 'string[]')],
    example: { component: 'Accordion', id: 'faq', items: [{ value: 'q1', label: 'Question', content: 'Answer' }] },
  },
  {
    name: 'Avatar', label: 'Avatar', contract: 'AvatarContract',
    description: 'User or entity avatar with fallback text.',
    props: [prop('src', 'string'), prop('alt', 'string'), prop('fallback', 'string'), prop('size', '"sm" | "md" | "lg"')],
    example: { component: 'Avatar', id: 'avatar', src: '/avatar.png', fallback: 'JD' },
  },
  {
    name: 'Combobox', label: 'Combobox', contract: 'ComboboxContract',
    description: 'Searchable single-value selection control.',
    props: [prop('items', '{value:string|number,label:string,disabled?:boolean}[]', true), prop('value', 'string | number'), prop('defaultValue', 'string | number'), prop('placeholder', 'string'), prop('disabled', 'boolean'), prop('name', 'string'), prop('label', 'string')],
    example: { component: 'Combobox', id: 'team', label: 'Team', items: [{ value: 'eng', label: 'Engineering' }] },
  },
  {
    name: 'Drawer', label: 'Drawer', contract: 'DrawerContract',
    description: 'Side panel overlay with configurable placement and size.',
    props: [prop('trigger', 'string'), prop('title', 'string', true), prop('description', 'string'), prop('open', 'boolean'), prop('defaultOpen', 'boolean'), prop('floatingTrigger', 'boolean'), prop('placement', '"left" | "right" | "top" | "bottom"'), prop('size', 'string'), prop('lazyMount', 'boolean'), prop('unmountOnExit', 'boolean')],
    example: { component: 'Drawer', id: 'filters', title: 'Filters', placement: 'right', children: ['filter-content'] },
  },
  {
    name: 'Empty', label: 'Empty', contract: 'EmptyContract',
    description: 'Empty-state content block.',
    props: [prop('title', 'string'), prop('description', 'string')],
    example: { component: 'Empty', id: 'empty', title: 'No results', description: 'Try another search.' },
  },
  {
    name: 'PasswordInput', label: 'Password input', contract: 'PasswordInputContract',
    description: 'Password field with visibility control.',
    props: [prop('label', 'string'), prop('value', 'string'), prop('defaultValue', 'string'), prop('placeholder', 'string'), prop('disabled', 'boolean'), prop('readOnly', 'boolean'), prop('required', 'boolean'), prop('name', 'string'), prop('error', 'string'), prop('helperText', 'string'), prop('autoComplete', '"current-password" | "new-password"')],
    example: { component: 'PasswordInput', id: 'password', label: 'Password', required: true },
  },
  {
    name: 'RadioGroup', label: 'Radio group', contract: 'RadioGroupContract',
    description: 'Single-choice option group.',
    props: [prop('items', '{value:string,label:string,disabled?:boolean}[]', true), prop('value', 'string'), prop('defaultValue', 'string'), prop('disabled', 'boolean'), prop('name', 'string'), prop('label', 'string')],
    example: { component: 'RadioGroup', id: 'plan', label: 'Plan', items: [{ value: 'free', label: 'Free' }] },
  },
  {
    name: 'SegmentGroup', label: 'Segment group', contract: 'SegmentGroupContract',
    description: 'Inline segmented single-choice control.',
    props: [prop('items', '{value:string,label:string,disabled?:boolean}[]', true), prop('value', 'string'), prop('defaultValue', 'string'), prop('disabled', 'boolean'), prop('name', 'string'), prop('label', 'string'), prop('fullWidth', 'boolean'), prop('size', '"sm" | "md" | "lg"')],
    example: { component: 'SegmentGroup', id: 'view', items: [{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }] },
  },
  {
    name: 'Skeleton', label: 'Skeleton', contract: 'SkeletonContract',
    description: 'Loading placeholder block.',
    props: [prop('width', 'string'), prop('height', 'string'), prop('circle', 'boolean'), prop('animated', 'boolean')],
    example: { component: 'Skeleton', id: 'loading-card', width: '100%', height: '120px' },
  },
  {
    name: 'Slider', label: 'Slider', contract: 'SliderContract',
    description: 'Numeric range input.',
    props: [prop('label', 'string'), prop('value', 'number'), prop('defaultValue', 'number'), prop('min', 'number'), prop('max', 'number'), prop('step', 'number'), prop('disabled', 'boolean'), prop('name', 'string')],
    example: { component: 'Slider', id: 'volume', label: 'Volume', min: 0, max: 100, value: 50 },
  },
  {
    name: 'Tooltip', label: 'Tooltip', contract: 'TooltipContract',
    description: 'Hover or focus tooltip around child content.',
    props: [prop('content', 'string', true), prop('open', 'boolean'), prop('defaultOpen', 'boolean'), prop('disabled', 'boolean'), prop('positioning', '"top" | "bottom" | "left" | "right"')],
    example: { component: 'Tooltip', id: 'help', content: 'More information', children: ['help-button'] },
  },
  {
    name: 'Tree', label: 'Tree', contract: 'TreeContract',
    description: 'Hierarchical tree with selection and expansion.',
    props: [prop('nodes', '{id:string,label:string,children?:object[],disabled?:boolean}[]', true), prop('label', 'string'), prop('selectionMode', '"single" | "multiple"'), prop('expandedValue', 'string[]'), prop('defaultExpandedValue', 'string[]'), prop('selectedValue', 'string[]'), prop('defaultSelectedValue', 'string[]'), prop('virtual', 'boolean'), prop('height', 'number | string'), prop('rowHeight', 'number'), prop('overscan', 'number'), prop('expandOnClick', 'boolean')],
    example: { component: 'Tree', id: 'file-tree', nodes: [{ id: 'src', label: 'src', children: [] }] },
  },
  {
    name: 'TreeSelect', label: 'Tree select', contract: 'TreeSelectContract',
    description: 'Hierarchical selection control.',
    props: [prop('nodes', '{id:string,label:string,children?:object[],disabled?:boolean}[]', true), prop('value', 'string | string[]'), prop('defaultValue', 'string | string[]'), prop('placeholder', 'string'), prop('disabled', 'boolean'), prop('name', 'string'), prop('label', 'string'), prop('selectBranches', 'boolean'), prop('multiple', 'boolean'), prop('height', 'number | string'), prop('columnWidth', 'number | string'), prop('columnWidths', '(number | string)[]'), prop('virtual', 'boolean'), prop('defaultExpandedValue', 'string[]'), prop('expandedValue', 'string[]')],
    example: { component: 'TreeSelect', id: 'department', label: 'Department', nodes: [] },
  },
  {
    name: 'Container', label: 'Container', contract: 'ContainerContract',
    description: 'Centered content container.',
    props: [prop('size', 'string'), prop('padded', 'boolean'), prop('center', 'boolean')],
    example: { component: 'Container', id: 'container', size: 'xl', children: ['content'] },
  },
  {
    name: 'Grid', label: 'Grid', contract: 'GridContract',
    description: 'Responsive grid layout.',
    props: [prop('columns', 'number | string'), prop('minChildWidth', 'string'), prop('gap', 'string'), prop('rowGap', 'string'), prop('columnGap', 'string'), prop('equalHeight', 'boolean')],
    example: { component: 'Grid', id: 'grid', columns: 3, gap: 'md', children: ['card1', 'card2'] },
  },
  {
    name: 'Split', label: 'Split layout', contract: 'SplitContract',
    description: 'Two-pane split layout.',
    props: [prop('ratio', 'string'), prop('gap', 'string'), prop('collapseBelow', 'string'), prop('sidebarWidth', 'string'), prop('align', 'string')],
    example: { component: 'Split', id: 'split', ratio: '1:2', children: ['sidebar', 'main'] },
  },
  {
    name: 'Spacer', label: 'Spacer', contract: 'SpacerContract',
    description: 'Flexible layout spacer.',
    props: [prop('size', 'string'), prop('grow', 'boolean')],
    example: { component: 'Spacer', id: 'spacer', grow: true },
  },
]

export const catalog: ComponentCatalog = baseCatalog.map(entry => {
  const supplements = CONTRACT_PROP_SUPPLEMENTS[entry.name] ?? []
  const existing = new Set(entry.props.map(prop => prop.name))
  return {
    ...entry,
    props: [...entry.props, ...supplements.filter(prop => !existing.has(prop.name))],
  }
}).concat(additionalCatalog)

/** Look up a catalog entry by component name. */
export function getCatalogEntry(name: string) {
  return catalog.find(e => e.name === name)
}
