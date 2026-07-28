import { lazy, Suspense, useEffect, useState, type ComponentType, type LazyExoticComponent } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { arkComponentCatalog } from '@demo/ui-core'
import '@demo/ui-web-components'
import './style.css'
import '@demo/ui-theme'
import { HSelect } from '@demo/ui-react'

type PageModule = LazyExoticComponent<ComponentType<unknown>>

type NavPage = {
  path: string
  title: string
  description: string
  page: PageModule
}

type NavGroup = {
  id: string
  title: string
  items: NavPage[]
}

const navGroups: NavGroup[] = [
  {
    id: 'showcase',
    title: 'Showcase',
    items: [
      {
        path: 'admin',
        title: 'Admin · Caterpillar',
        description: 'CAT yellow/black heavy-ops command center.',
        page: lazy(() => import('./views/admin')),
      },
      {
        path: 'admin-komatsu',
        title: 'Admin · Komatsu',
        description: 'Komatsu blue Smart Construction desk.',
        page: lazy(() => import('./views/admin-komatsu')),
      },
      {
        path: 'payments',
        title: 'Payments · Stripe',
        description: 'Stripe-inspired payment overview dashboard.',
        page: lazy(() => import('./views/payments')),
      },
      {
        path: 'linear',
        title: 'Analytics · Vercel',
        description: 'Vercel-inspired analytics dashboard with charts and tables.',
        page: lazy(() => import('./views/linear')),
      },
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    items: [
      {
        path: 'layout',
        title: 'Layout primitives',
        description: 'Container, Stack, Grid, Split, Spacer.',
        page: lazy(() => import('./views/layout')),
      },
    ],
  },
  {
    id: 'form',
    title: 'Form',
    items: [
      { path: 'input', title: 'Input', description: 'Text field.', page: lazy(() => import('./views/input')) },
      { path: 'textarea', title: 'Textarea', description: 'Multi-line text.', page: lazy(() => import('./views/textarea')) },
      {
        path: 'number-input',
        title: 'Number Input',
        description: 'Numeric steppers.',
        page: lazy(() => import('./views/number-input')),
      },
      {
        path: 'password-input',
        title: 'Password Input',
        description: 'Show / hide password.',
        page: lazy(() => import('./views/password-input')),
      },
      { path: 'select', title: 'Select', description: 'Single select.', page: lazy(() => import('./views/select')) },
      { path: 'combobox', title: 'Combobox', description: 'Searchable select.', page: lazy(() => import('./views/combobox')) },
      { path: 'radio', title: 'Radio Group', description: 'Single choice.', page: lazy(() => import('./views/radio')) },
      {
        path: 'segment-group',
        title: 'Segment Group',
        description: 'Segmented control.',
        page: lazy(() => import('./views/segment-group')),
      },
      { path: 'checkbox', title: 'Checkbox', description: 'Boolean control.', page: lazy(() => import('./views/checkbox')) },
      { path: 'toggle', title: 'Toggle', description: 'On / off switch.', page: lazy(() => import('./views/toggle')) },
      { path: 'slider', title: 'Slider', description: 'Range control.', page: lazy(() => import('./views/slider')) },
      {
        path: 'date-picker',
        title: 'Date Picker',
        description: 'Calendar dates.',
        page: lazy(() => import('./views/date-picker')),
      },
    ],
  },
  {
    id: 'data',
    title: 'Data',
    items: [
      {
        path: 'table',
        title: 'Table',
        description: 'TanStack Table shell.',
        page: lazy(() => import('./views/table')),
      },
      {
        path: 'chart',
        title: 'Chart',
        description: 'ECharts shell (line / bar / pie / area / gauge).',
        page: lazy(() => import('./views/chart')),
      },
      {
        path: 'tree',
        title: 'Tree',
        description: 'Ark TreeView + TanStack Virtual.',
        page: lazy(() => import('./views/tree')),
      },
    ],
  },
  {
    id: 'display',
    title: 'Display',
    items: [
      { path: 'button', title: 'Button', description: 'Action control.', page: lazy(() => import('./views/button')) },
      { path: 'card', title: 'Card', description: 'Content surface.', page: lazy(() => import('./views/card')) },
      { path: 'tag', title: 'Tag', description: 'Status label.', page: lazy(() => import('./views/tag')) },
      { path: 'badge', title: 'Badge', description: 'Count / dot.', page: lazy(() => import('./views/badge')) },
      { path: 'avatar', title: 'Avatar', description: 'User portrait.', page: lazy(() => import('./views/avatar')) },
      { path: 'progress', title: 'Progress', description: 'Linear bar.', page: lazy(() => import('./views/progress')) },
      { path: 'skeleton', title: 'Skeleton', description: 'Loading placeholder.', page: lazy(() => import('./views/skeleton')) },
      { path: 'empty', title: 'Empty', description: 'Empty state.', page: lazy(() => import('./views/empty')) },
      { path: 'separator', title: 'Separator', description: 'Divider.', page: lazy(() => import('./views/separator')) },
    ],
  },
  {
    id: 'overlay',
    title: 'Overlay',
    items: [
      { path: 'dialog', title: 'Dialog', description: 'Modal dialog.', page: lazy(() => import('./views/dialog')) },
      { path: 'drawer', title: 'Drawer', description: 'Edge panel.', page: lazy(() => import('./views/drawer')) },
      { path: 'tooltip', title: 'Tooltip', description: 'Hover hint.', page: lazy(() => import('./views/tooltip')) },
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    items: [
      { path: 'tabs', title: 'Tabs', description: 'Panel switcher.', page: lazy(() => import('./views/tabs')) },
      {
        path: 'accordion',
        title: 'Accordion',
        description: 'Expand / collapse.',
        page: lazy(() => import('./views/accordion')),
      },
    ],
  },
]

const pages = navGroups.flatMap(group => group.items)

const themes = ['default', 'compact', 'industry', 'industry-dark'] as const
type ThemeName = (typeof themes)[number]
const themeItems = themes.map(item => ({ value: item, label: item }))

function Shell() {
  const [theme, setTheme] = useState<ThemeName>('default')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="eyebrow">UI LIBRARY</p>
        <h2>Components</h2>
        <div className="theme-switch">
          <HSelect
            label="Theme"
            items={themeItems}
            value={theme}
            onValueChange={d => {
              if ((themes as readonly string[]).includes(d.value)) {
                setTheme(d.value as ThemeName)
              }
            }}
          />
        </div>
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.id} className="sidebar-group">
              <p className="sidebar-group__title">{group.title}</p>
              <div className="sidebar-group__links">
                {group.items.map(page => (
                  <NavLink
                    className={({ isActive }) => `route-link${isActive ? ' active' : ''}`}
                    key={page.path}
                    to={`/${page.path}`}
                    title={page.description}
                  >
                    {page.title}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="route-page">
        <Suspense fallback={<div className="loading">Loading component demo...</div>}>
          <Routes>
            {pages.map(({ path, page: Page }) => (
              <Route element={<Page />} key={path} path={`/${path}`} />
            ))}
            <Route element={<Navigate replace to="/admin" />} path="*" />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}

const catalog = document.getElementById('ark-catalog')
if (catalog) {
  catalog.innerHTML = arkComponentCatalog
    .map(component => `<span class="catalog-item">${component.name}</span>`)
    .join('')
}

const app = document.getElementById('app')
const runtime = globalThis as typeof globalThis & { __uiLibraryPlaygroundRoot?: Root }
if (app) {
  runtime.__uiLibraryPlaygroundRoot ??= createRoot(app)
  runtime.__uiLibraryPlaygroundRoot.render(<App />)
}
