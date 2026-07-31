import '../page-styles/production-operations.css'

import { HButton, HInput, HNavMenu, HSelect, HTable, HTreeSelect, HToggle, type HNavMenuItem } from '@demo/ui-react'
import type { TableColumnContract, TableRowData } from '@demo/ui-core'
import type { ColumnDef } from '@tanstack/react-table'
import { useState, type ReactNode } from 'react'

type Machine = {
  id: number
  name: string
  code: string
  terminal: string
  product: string
  type: string
  energy: string
  driving: string
  icon: 'loader' | 'truck' | 'refuel'
  detail: string[]
}

const machines: Machine[] = [
  {
    id: 1,
    name: '5号装载机',
    code: '20253',
    terminal: '5211115110200031',
    product: '5211115110200031',
    type: '辅助生产设备->装载机',
    energy: '油车',
    driving: '有人驾驶',
    icon: 'loader',
    detail: ['2026-07-01 10:10:01', '0', '20523', '1', '5211115110200031', '0.04', '0.00', '4.00', '0.03', '0.03', '110.07', '39.83', '1440.10', '13367'],
  },
  {
    id: 2,
    name: '李文军蒙KTG593',
    code: '李文军蒙KTG593',
    terminal: '2220615103200191',
    product: '2220615103200191',
    type: '辅助生产设备->指挥车',
    energy: '油车',
    driving: '有人驾驶',
    icon: 'truck',
    detail: ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  },
  {
    id: 3,
    name: '1号加油车',
    code: 'LZGCG2R02NX11215',
    terminal: '5211115110200069',
    product: '5211115110200069',
    type: '加油设备->加油车',
    energy: '',
    driving: '',
    icon: 'refuel',
    detail: ['2026-06-11 18:11:57', '0', '20523', '4', '5211115110200069', '0.00', '0.00', '0.00', '0.00', '0.00', '110.50', '39.42', '1238.50', '15355'],
  },
]

const filterItems = {
  department: [{ value: 'all', label: '全部部门' }, { value: 'production', label: '生产运营部' }],
  reminder: [{ value: 'all', label: '年检提醒' }, { value: 'soon', label: '即将到期' }],
  energy: [{ value: 'all', label: '能源类型' }, { value: 'oil', label: '油车' }, { value: 'electric', label: '电车' }],
  driving: [{ value: 'all', label: '驾驶类型' }, { value: 'human', label: '有人驾驶' }, { value: 'auto', label: '无人驾驶' }],
}

const deviceTypeNodes = [
  {
    id: 'auxiliary-production',
    label: '辅助生产设备',
    children: [
      { id: 'loader', label: '装载机' },
      { id: 'truck', label: '指挥车' },
    ],
  },
  {
    id: 'refueling-equipment',
    label: '加油设备',
    children: [{ id: 'refuel', label: '加油车' }],
  },
]

const replicaNavItems: HNavMenuItem[] = [
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

const detailLabels = ['屏显当地时间', '车辆状态', '应用程序版本', 'GPS精准标识', '回传登录号', '车速 (km/h)', '发动机转速 (r/min)', '机油压力 (Kpa)', '压力P1瞬时值', '压力P2瞬时值', '经度', '纬度', '高度 (m)', '总卸车次数']

const replicaColumns: TableColumnContract[] = [
  { accessorKey: 'icon', header: '设备图标', size: 70, minSize: 70, enableSorting: false, align: 'center' },
  { accessorKey: 'id', header: '序号', size: 80, minSize: 80, enableSorting: false, align: 'center' },
  { accessorKey: 'name', header: '设备名称', size: 170, minSize: 150 },
  { accessorKey: 'code', header: '设备机号', size: 140, minSize: 140 },
  { accessorKey: 'state', header: '设备状态', size: 120, minSize: 120, enableSorting: false, align: 'center' },
  { accessorKey: 'terminal', header: '智能终端编号', size: 160, minSize: 160 },
  { accessorKey: 'product', header: '行为监控产品编号', size: 220, minSize: 220 },
  { accessorKey: 'type', header: '设备类型', size: 160, minSize: 160 },
  { accessorKey: 'energy', header: '能源类型', size: 120, minSize: 120, align: 'center' },
  { accessorKey: 'driving', header: '驾驶类型', size: 120, minSize: 120, align: 'center' },
  { accessorKey: 'multiplier', header: '倍数', size: 120, minSize: 120, align: 'center' },
  { accessorKey: 'inspection', header: '年检报告', size: 130, minSize: 130, align: 'center' },
  { accessorKey: 'inspectionDate', header: '年检到期日期', size: 130, minSize: 130, align: 'center' },
  { accessorKey: 'statusText', header: '设备状态', size: 130, minSize: 130, align: 'center' },
  { accessorKey: 'department', header: '部门', size: 130, minSize: 130, align: 'center' },
  { accessorKey: 'config', header: '其他配置', size: 130, minSize: 130, align: 'center' },
  { accessorKey: 'disabled', header: '停用/恢复', size: 100, minSize: 100, enableSorting: false, align: 'center', pinned: 'right' },
  { accessorKey: 'edit', header: '修改', size: 80, minSize: 80, enableSorting: false, align: 'center', pinned: 'right' },
  { accessorKey: 'logs', header: '日志', size: 80, minSize: 80, enableSorting: false, align: 'center', pinned: 'right' },
]

const replicaData: TableRowData[] = machines.map(machine => ({
  ...machine,
  state: '未连接',
  multiplier: '无',
  inspection: '启用',
  inspectionDate: '',
  statusText: '启用',
  department: '蒙兴煤矿',
  config: '',
  disabled: '',
  edit: '',
  logs: '',
}))

function EquipmentIcon({ kind }: { kind: Machine['icon'] }) {
  const source = {
    loader: '/production-assets/loader-oil.png',
    truck: '/production-assets/command-car-oil.png',
    refuel: '/production-assets/refueling-truck-oil.png',
  }[kind]
  return <img className="replica-machine-icon" src={source} alt="设备图标" />
}

function BrandLogo({ small = false }: { small?: boolean }) {
  return <img className={`replica-brand__logo${small ? ' replica-brand__logo--small' : ''}`} src="/production-assets/icon.png" alt="数字矿山" />
}

function DeviceState() {
  return <svg className="replica-device-state" viewBox="0 0 24 24" aria-label="未连接"><path d="M3 3l18 18M7.2 8.1a8.5 8.5 0 0 0 .7 9.1M16.1 7.2a8.5 8.5 0 0 1 .7 9.1M12 12v7" /></svg>
}

function ActionIcon({ src, label }: { src: string; label: string }) {
  return <img className="replica-action-icon" src={src} alt={label} />
}

function ReplicaAction({ label, children }: { label: string; children: ReactNode }) {
  return <HButton type="button" variant="ghost" size="sm" className="replica-icon-button" aria-label={label}>{children}</HButton>
}

const replicaColumnDefs: ColumnDef<TableRowData>[] = [
  { id: 'icon', accessorKey: 'icon', header: '设备图标', cell: info => <EquipmentIcon kind={info.getValue() as Machine['icon']} /> },
  { id: 'id', accessorKey: 'id', header: '序号', cell: info => info.getValue() },
  { id: 'name', accessorKey: 'name', header: '设备名称', cell: info => <span className="replica-link">{info.getValue() as ReactNode}</span> },
  { id: 'code', accessorKey: 'code', header: '设备机号', cell: info => <span className="replica-link">{info.getValue() as ReactNode}</span> },
  { id: 'state', accessorKey: 'state', header: '设备状态', cell: () => <DeviceState /> },
  { id: 'terminal', accessorKey: 'terminal', header: '智能终端编号', cell: info => info.getValue() },
  { id: 'product', accessorKey: 'product', header: '行为监控产品编号', cell: info => info.getValue() },
  { id: 'type', accessorKey: 'type', header: '设备类型', cell: info => info.getValue() },
  { id: 'energy', accessorKey: 'energy', header: '能源类型', cell: info => info.getValue() },
  { id: 'driving', accessorKey: 'driving', header: '驾驶类型', cell: info => info.getValue() },
  { id: 'multiplier', accessorKey: 'multiplier', header: '倍数', cell: info => info.getValue() },
  { id: 'inspection', accessorKey: 'inspection', header: '年检报告', cell: info => info.getValue() },
  { id: 'inspectionDate', accessorKey: 'inspectionDate', header: '年检到期日期', cell: info => info.getValue() },
  { id: 'statusText', accessorKey: 'statusText', header: '设备状态', cell: info => info.getValue() },
  { id: 'department', accessorKey: 'department', header: '部门', cell: info => info.getValue() },
  { id: 'config', accessorKey: 'config', header: '其他配置', cell: info => info.getValue() },
  { id: 'disabled', accessorKey: 'disabled', header: '停用/恢复', cell: () => null },
  { id: 'edit', accessorKey: 'edit', header: '修改', cell: () => <ReplicaAction label="修改"><ActionIcon src="/production-assets/edit.png" label="修改" /></ReplicaAction> },
  { id: 'logs', accessorKey: 'logs', header: '日志', cell: () => <ReplicaAction label="日志"><ActionIcon src="/production-assets/logs.png" label="日志" /></ReplicaAction> },
]

export default function ProductionOperationsView() {
  const [disabledOnly, setDisabledOnly] = useState(false)
  const [menuCollapsed, setMenuCollapsed] = useState(false)
  const [selectedNavKeys, setSelectedNavKeys] = useState(['device-info'])
  const [openNavKeys, setOpenNavKeys] = useState(['basic-info', 'operation-records', 'operation-management'])
  const [department, setDepartment] = useState('')
  const [type, setType] = useState('')
  const [reminder, setReminder] = useState('')
  const [energy, setEnergy] = useState('')
  const [driving, setDriving] = useState('')

  return (
    <div className="production-replica">
      <header className="replica-topbar">
        <div className="replica-brand"><BrandLogo /><strong>数字矿山</strong></div>
        <button
          className="replica-menu-button"
          type="button"
          aria-label={menuCollapsed ? '展开菜单' : '收起菜单'}
          aria-expanded={!menuCollapsed}
          onClick={() => setMenuCollapsed(value => !value)}
        >☰</button>
        <nav className="replica-main-nav" aria-label="主导航">
          {['实时动态', '生产运营', '规划引导', '安全防护', '系统管理'].map(item => <span className={item === '生产运营' ? 'active' : ''} key={item}>{item}</span>)}
        </nav>
        <div className="replica-user-area">
          <span>项目：</span>
          <HSelect items={[{ value: 'mine', label: '蒙兴煤矿' }]} value="mine" />
          <span className="replica-welcome">欢迎用户·曹冬燕</span>
          <span className="replica-user-mark">A☆</span>
          <BrandLogo small />
        </div>
      </header>

      <div className="replica-body">
        <aside className={`replica-sidebar${menuCollapsed ? ' replica-sidebar--collapsed' : ''}`}>
          <HNavMenu
            items={replicaNavItems}
            mode="inline"
            theme="dark"
            inlineCollapsed={menuCollapsed}
            triggerSubMenuAction="click"
            selectedKeys={selectedNavKeys}
            openKeys={openNavKeys}
            onSelect={details => setSelectedNavKeys(details.selectedKeys)}
            onOpenChange={details => setOpenNavKeys(details.openKeys)}
            className="replica-nav-menu"
          />
          <div hidden>
          <div className="replica-side-group replica-side-group--heading"><span className="replica-side-icon">▤</span><strong>基础信息</strong><span className="replica-side-caret">⌃</span></div>
          <button className="replica-side-item replica-side-item--active"><span>▤</span>设备信息</button>
          <button className="replica-side-item"><span>♙</span>人员列表</button>
          <button className="replica-side-item"><span>⚙</span>配置信息</button>
          <div className="replica-side-group"><span className="replica-side-icon">▧</span><strong>运营记录</strong><span className="replica-side-caret">⌄</span></div>
          <button className="replica-side-item"><span>♢</span>调度管理</button>
          <div className="replica-side-group"><span className="replica-side-icon">▧</span><strong>运营管理</strong><span className="replica-side-caret">⌄</span></div>
          <button className="replica-side-item"><span>▥</span>运营报表</button>
          </div>
        </aside>

        <main className="replica-content">
          <section className="replica-filters" aria-label="设备筛选">
            <div className="replica-form-left">
              <HInput aria-label="设备名称" placeholder="设备名称" />
              <HSelect aria-label="部门" placeholder="部门" items={filterItems.department} value={department} onValueChange={d => setDepartment(d.value)} />
              <HTreeSelect
                placeholder="设备类型"
                nodes={deviceTypeNodes}
                selectBranches
                value={type}
                height={220}
                columnWidths={[180, 220]}
                onValueChange={d => setType(typeof d.value === 'string' ? d.value : d.value[0] ?? '')}
              />
              <HInput aria-label="设备机号" placeholder="设备机号" />
              <HSelect aria-label="年检提醒" placeholder="年检提醒" items={filterItems.reminder} value={reminder} onValueChange={d => setReminder(d.value)} />
              <HSelect aria-label="能源类型" placeholder="能源类型" items={filterItems.energy} value={energy} onValueChange={d => setEnergy(d.value)} />
              <HSelect aria-label="驾驶类型" placeholder="驾驶类型" items={filterItems.driving} value={driving} onValueChange={d => setDriving(d.value)} />
              <HToggle checked={disabledOnly} onCheckedChange={d => setDisabledOnly(d.checked)}>是否停用：</HToggle>
              <HButton className="replica-action">查询</HButton>
            </div>
            <div className="replica-right-menu">
              <HButton className="replica-action">新增设备</HButton>
              <HButton className="replica-action">下载列表</HButton>
            </div>
          </section>

          <section className="replica-table-wrap" aria-label="设备列表">
            <HTable
              columns={replicaColumns}
              columnDefs={replicaColumnDefs}
              data={replicaData}
              fillHeight
              enableSorting={false}
              resizeable
              draggable
              columnResizeMode="onChange"
              enableExpanding
              defaultExpanded={{ '0': true, '2': true }}
              renderExpanded={row => {
                const machine = row.original as unknown as Machine
                return (
                  <div className="replica-detail-container">
                    <div className="replica-detail-scroll">
                      <div className="replica-detail-grid">
                        {machine.detail.map((value, index) => (
                          <div key={`${machine.id}-${index}`}>
                            <span className="replica-detail-label">{detailLabels[index]}</span>
                            <span className="replica-detail-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </section>

          <footer className="replica-pagination">
            <span>共 3 条</span>
            <HSelect items={[{ value: '10', label: '10条/页' }, { value: '20', label: '20条/页' }]} value="10" />
            <HButton type="button" variant="ghost" size="sm" className="replica-page-button" aria-label="上一页">‹</HButton>
            <HButton type="button" size="sm" className="replica-page-button replica-page-button--active">1</HButton>
            <HButton type="button" variant="ghost" size="sm" className="replica-page-button" aria-label="下一页">›</HButton>
            <span className="replica-jump-label">前往</span>
            <HInput aria-label="页码" value="1" readOnly />
            <span>页</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
