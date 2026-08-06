// One-off: attendance-records page as a single A2UI composer document.
// Uses ONLY official v0.9 Basic Catalog components.
const HDRS = [
  '序号', '日期', '设备名称', '班次', '车队', '设备类型',
  '开始时间', '结束时间', '驾驶员', '图片', '出勤状态', '出勤率(%)',
  '备注', '工作时长(h)', '装车时长(h)', '挖装设备等待时长(h)', '重车时长(h)',
  '运输设备等待时长(h)', '怠速时长(h)', '维修时长(h)', '工作区时长(h)',
  '休息区时长(h)', '里程(km)', '加油量(L)', '油耗(L)', '轨迹',
]
const ROWS = [
  ['1', '2026-08-02', '李文军蒙KTG593', '白班', '蒙兴煤矿', '辅助生产设备', '2026-08-02 06:00:00', '2026-08-02 18:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
  ['2', '2026-08-02', '5号装载机', '白班', '蒙兴煤矿', '辅助生产设备', '2026-08-02 06:00:00', '2026-08-02 18:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
  ['3', '2026-08-02', '1号加油车', '白班', '蒙兴煤矿', '加油设备', '2026-08-02 06:00:00', '2026-08-02 18:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
  ['4', '2026-08-02', '李文军蒙KTG593', '晚班', '蒙兴煤矿', '辅助生产设备', '2026-08-02 18:00:00', '2026-08-03 06:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
  ['5', '2026-08-02', '5号装载机', '晚班', '蒙兴煤矿', '辅助生产设备', '2026-08-02 18:00:00', '2026-08-03 06:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
  ['6', '2026-08-02', '1号加油车', '晚班', '蒙兴煤矿', '加油设备', '2026-08-02 18:00:00', '2026-08-03 06:00:00', '空', '无图片', '休息', '0', '空', '0.00', '0.0', '0.0', '0.0', '0.0', '0.0', '0.00', '0.0', '0.0', '0.00', '0.00', '0.00', '空'],
]

const C = []
const add = (c) => C.push(c)
const T = (id, text, variant) => add({ id, component: 'Text', text, ...(variant ? { variant } : {}) })
const txt = (text) => ({ component: 'Text', text })

// ── Header ──────────────────────────────────────────────────
T('brand-text', '腾闰易立方', 'h4')
for (const [i, label] of ['实时动态', '生产运营', '规划引导', '安全防护', '系统管理'].entries()) T(`nav-${i + 1}`, label)
T('project-text', '项目:蒙兴煤矿')
T('welcome-text', '欢迎用户:曹冬燕')
add({ id: 'nav-row', component: 'Row', align: 'center', children: ['nav-1', 'nav-2', 'nav-3', 'nav-4', 'nav-5'] })
add({ id: 'user-row', component: 'Row', align: 'center', children: ['project-text', 'welcome-text'] })
add({ id: 'header', component: 'Row', justify: 'spaceBetween', align: 'center', children: ['brand-text', 'nav-row', 'user-row'] })

// ── Left nav ────────────────────────────────────────────────
const NAV = [
  ['nav-basic', '基础信息', [['t-device-info', '设备信息'], ['t-person-list', '人员列表'], ['t-config-info', '配置信息']]],
  ['nav-op', '运营记录', [['t-load-unload', '装卸记录'], ['t-attendance-menu', '出勤记录'], ['t-refuel', '加油记录']]],
  ['nav-om', '运营管理', [['t-measure', '计量核验'], ['t-full-load', '满载核验']]],
]
for (const [listId, title, items] of NAV) {
  T(`${listId}-title`, title)
  for (const [id, label] of items) T(id, label)
  add({ id: listId, component: 'List', direction: 'vertical', children: [`${listId}-title`, ...items.map(([id]) => id)] })
}
add({ id: 'nav-col', component: 'Column', align: 'start', children: ['nav-basic', 'nav-op', 'nav-om'] })

// ── Filters ─────────────────────────────────────────────────
add({ id: 'f-devtype', component: 'ChoicePicker', label: '设备类型', variant: 'mutuallyExclusive', filterable: true, options: [
  { label: '辅助生产设备', value: 'auxiliary-production' },
  { label: '运输设备', value: 'transport-equipment' },
  { label: '挖装设备', value: 'digging-equipment' },
  { label: '加油设备', value: 'refueling-equipment' },
], value: [] })
add({ id: 'f-devname', component: 'TextField', label: '设备名称', value: '', variant: 'shortText' })
add({ id: 'f-attendance', component: 'ChoicePicker', label: '出勤状态', variant: 'mutuallyExclusive', options: [
  { label: '休息', value: 'rest' }, { label: '维修', value: 'maintenance' }, { label: '工作', value: 'work' },
], value: [] })
add({ id: 'f-shift', component: 'ChoicePicker', label: '班次', variant: 'mutuallyExclusive', options: [
  { label: '白班', value: 'day' }, { label: '晚班', value: 'night' },
], value: [] })
add({ id: 'f-date-start', component: 'DateTimeInput', value: '2026-08-02', enableDate: true, label: '开始日期' })
add({ id: 'f-date-end', component: 'DateTimeInput', value: '2026-08-02', enableDate: true, label: '结束日期' })
T('t-query', '查询'); T('t-download', '下载列表'); T('t-columns', '列表筛选')
add({ id: 'btn-query', component: 'Button', variant: 'primary', child: 't-query', action: { name: 'query', context: {} } })
add({ id: 'btn-download', component: 'Button', variant: 'default', child: 't-download', action: { name: 'downloadList', context: {} } })
add({ id: 'btn-columns', component: 'Button', variant: 'default', child: 't-columns', action: { name: 'columnSettings', context: {} } })
add({ id: 'filters', component: 'Row', align: 'center', children: ['f-devtype', 'f-devname', 'f-attendance', 'f-shift', 'f-date-start', 'f-date-end', 'btn-query', 'btn-download', 'btn-columns'] })

// ── Table ───────────────────────────────────────────────────
for (const [i, h] of HDRS.entries()) T(`th-${String(i + 1).padStart(2, '0')}`, h)
add({ id: 't-header-row', component: 'Row', align: 'center', children: HDRS.map((_, i) => `th-${String(i + 1).padStart(2, '0')}`) })
for (const [r, row] of ROWS.entries()) {
  row.forEach((cell, c) => T(`td-${r + 1}-${String(c + 1).padStart(2, '0')}`, cell))
  add({ id: `row-${r + 1}`, component: 'Row', align: 'center', children: row.map((_, c) => `td-${r + 1}-${String(c + 1).padStart(2, '0')}`) })
}
add({ id: 't-body-list', component: 'List', direction: 'vertical', children: ROWS.map((_, r) => `row-${r + 1}`) })
add({ id: 'table-col', component: 'Column', align: 'stretch', children: ['t-header-row', 't-body-list'] })
add({ id: 'table-card', component: 'Card', child: 'table-col' })

// ── Pagination ──────────────────────────────────────────────
T('p-total', '共 6 条')
add({ id: 'p-size', component: 'ChoicePicker', label: '每页条数', variant: 'mutuallyExclusive', options: [
  { label: '10条/页', value: '10' }, { label: '20条/页', value: '20' },
], value: ['10'] })
T('t-prev', '‹'); T('t-page1', '1'); T('t-next', '›')
T('p-jump-label', '前往'); T('p-unit', '页')
add({ id: 'p-jump-input', component: 'TextField', label: '页码', value: '1', variant: 'number' })
add({ id: 'p-prev', component: 'Button', variant: 'default', child: 't-prev', action: { name: 'prevPage', context: {} } })
add({ id: 'p-page1', component: 'Button', variant: 'default', child: 't-page1', action: { name: 'gotoPage', context: { page: 1 } } })
add({ id: 'p-next', component: 'Button', variant: 'default', child: 't-next', action: { name: 'nextPage', context: {} } })
add({ id: 'pagination', component: 'Row', align: 'center', children: ['p-total', 'p-size', 'p-prev', 'p-page1', 'p-next', 'p-jump-label', 'p-jump-input', 'p-unit'] })

// ── Shell ───────────────────────────────────────────────────
add({ id: 'content-col', component: 'Column', align: 'stretch', children: ['filters', 'table-card', 'pagination'] })
add({ id: 'body', component: 'Row', align: 'stretch', children: ['nav-col', 'content-col'] })
add({ id: 'app-column', component: 'Column', align: 'stretch', children: ['header', 'body'] })
add({ id: 'root', component: 'Card', child: 'app-column' })

// Validate all refs resolve
const byId = new Set(C.map(c => c.id))
const missing = []
for (const c of C) {
  if (c.children) for (const ch of c.children) if (!byId.has(ch)) missing.push(`${c.id}->${ch}`)
  if (c.child && !byId.has(c.child)) missing.push(`${c.id}->child:${c.child}`)
}
if (missing.length) { console.error('MISSING:', missing); process.exit(1) }

const doc = { root: 'root', components: C, data: {} }
process.stdout.write(JSON.stringify(doc, null, 2) + '\n')
console.error(`OK: ${C.length} components`)
