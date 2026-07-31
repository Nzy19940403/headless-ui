import { defineComponent, h, ref } from 'vue'
import { useState } from 'react'
import { HBadge, HButton, HEmpty,HNavMenu, type HNavMenuItem } from '@demo/ui-react'
import { HNavMenu as VueHNavMenu, HStack as VueHStack, HBadge as VueHBadge, HButton as VueHButton } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const navItems: HNavMenuItem[] = [
  { key: 'overview', label: 'Overview', icon: '◈' },
  {
    key: 'operations',
    label: 'Operations',
    icon: '▦',
    children: [
      { key: 'devices', label: 'Devices', icon: '▣', extra: <HBadge tone="info">12</HBadge> },
      { key: 'dispatch', label: 'Dispatch', icon: '⇄' },
      { key: 'reports', label: 'Reports', icon: '▤' },
    ],
  },
  {
    key: 'security',
    label: 'Security',
    icon: '◇',
    children: [
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles', disabled: true },
    ],
  },
  { key: 'divider', type: 'divider' },
  {
    key: 'system-group',
    type: 'group',
    label: 'System',
    children: [
      { key: 'settings', label: 'Settings', icon: '⚙' },
      { key: 'help', label: 'Help', icon: '?' },
    ],
  },
]

const VueNavMenuDemo = defineComponent({
  name: 'VueNavMenuDemo',
  setup() {
    const selectedKeys = ref(['devices'])
    const openKeys = ref(['operations'])
    const collapsed = ref(false)

    // Create Vue-native badge for the Devices item (React JSX can't render in Vue)
    const devicesBadge = h(VueHBadge, { tone: 'info' }, { default: () => '12' })

    const vueNavItems = [
      { key: 'overview', label: 'Overview', icon: '◈' },
      {
        key: 'operations',
        label: 'Operations',
        icon: '▦',
        children: [
          { key: 'devices', label: 'Devices', icon: '▣', extra: devicesBadge },
          { key: 'dispatch', label: 'Dispatch', icon: '⇄' },
          { key: 'reports', label: 'Reports', icon: '▤' },
        ],
      },
      {
        key: 'security',
        label: 'Security',
        icon: '◇',
        children: [
          { key: 'users', label: 'Users' },
          { key: 'roles', label: 'Roles', disabled: true },
        ],
      },
      { key: 'divider-1', type: 'divider' as const },
      {
        key: 'system-group',
        type: 'group' as const,
        label: 'System',
        children: [
          { key: 'settings', label: 'Settings', icon: '⚙' },
          { key: 'help', label: 'Help', icon: '?' },
        ],
      },
    ]

    return () =>
      h('div', { class: 'demo-stack', style: { alignItems: 'flex-start', gap: '16px' } }, [
        h(VueHButton, {
          variant: 'secondary',
          size: 'sm',
          onClick: () => { collapsed.value = !collapsed.value },
        }, { default: () => collapsed.value ? 'Expand menu' : 'Collapse menu' }),
        h('div', { style: { width: collapsed.value ? '64px' : '260px', minHeight: '360px', transition: 'width 160ms ease' } }, [
          h(VueHNavMenu, {
            items: vueNavItems,
            mode: 'inline',
            theme: 'dark',
            inlineCollapsed: collapsed.value,
            triggerSubMenuAction: 'click',
            selectedKeys: selectedKeys.value,
            openKeys: openKeys.value,
            onSelect: (details: any) => { selectedKeys.value = details.selectedKeys },
            onOpenChange: (details: any) => { openKeys.value = details.openKeys },
          }),
        ]),
        h('span', { class: 'demo-result' }, `Selected: ${selectedKeys.value.join(', ') || '(none)'} · Open: ${openKeys.value.join(', ') || '(none)'}`),
      ])
  },
})

function ReactNavMenuDemo() {
  const [selectedKeys, setSelectedKeys] = useState(['devices'])
  const [openKeys, setOpenKeys] = useState(['operations'])
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="demo-stack" style={{ alignItems: 'flex-start', gap: 16 }}>
      <HButton variant="secondary" size="sm" onClick={() => setCollapsed(value => !value)}>
        {collapsed ? 'Expand menu' : 'Collapse menu'}
      </HButton>
      <div style={{ width: collapsed ? 64 : 260, minHeight: 360, transition: 'width 160ms ease' }}>
        <HNavMenu
          items={navItems}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          triggerSubMenuAction="click"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onSelect={details => setSelectedKeys(details.selectedKeys)}
          onOpenChange={details => setOpenKeys(details.openKeys)}
        />
      </div>
      <span className="demo-result">
        Selected: {selectedKeys.join(', ') || '(none)'} · Open: {openKeys.join(', ') || '(none)'}
      </span>
    </div>
  )
}

export default function NavMenuView() {
  const definition: ViewDefinition = {
    apiKey: 'navMenu',
    title: 'NavMenu',
    description: 'React-first Ant Design-style navigation menu. Drawer/layout ownership stays outside the menu.',
    reactDemo: <ReactNavMenuDemo />,
    vueDemo: VueNavMenuDemo,
    // webDemo: <div className="demo-placeholder">Web Component HNavMenu is planned after the React API is settled.</div>,
    webDemo:<HEmpty title="暂未实现"/> 
  }
  return <ComponentPage {...definition} />
}
