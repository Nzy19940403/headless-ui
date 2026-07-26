import { lazy, Suspense, useEffect, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { HashRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { arkComponentCatalog } from '@demo/ui-core'
import '@demo/ui-web-components'
import './style.css'
import '@demo/ui-theme'

const pages = [
  { path: 'admin', title: 'Admin Demo', description: 'A management page assembled from the current UI package.', page: lazy(() => import('./views/admin')) },
  { path: 'button', title: 'Button', description: 'A single action component.', page: lazy(() => import('./views/button')) },
  { path: 'card', title: 'Card', description: 'A surface component for grouping business content.', page: lazy(() => import('./views/card')) },
  { path: 'tag', title: 'Tag', description: 'A compact status label.', page: lazy(() => import('./views/tag')) },
  { path: 'checkbox', title: 'Checkbox', description: 'A selectable boolean control.', page: lazy(() => import('./views/checkbox')) },
  { path: 'dialog', title: 'Dialog', description: 'A modal surface with focus management.', page: lazy(() => import('./views/dialog')) },
  { path: 'tabs', title: 'Tabs', description: 'Switch between related panels.', page: lazy(() => import('./views/tabs')) },
  { path: 'accordion', title: 'Accordion', description: 'Expand and collapse related content.', page: lazy(() => import('./views/accordion')) },
  { path: 'toggle', title: 'Toggle', description: 'A persistent on/off control.', page: lazy(() => import('./views/toggle')) },
]

function Shell() {
  const [theme, setTheme] = useState<'default' | 'compact'>('default')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="eyebrow">UI LIBRARY</p>
        <h2>Components</h2>
        <button className="theme-switch" type="button" onClick={() => setTheme(value => value === 'default' ? 'compact' : 'default')}>
          Theme: {theme}
        </button>
        <nav>
          {pages.map(page => (
            <NavLink
              className={({ isActive }) => `route-link${isActive ? ' active' : ''}`}
              key={page.path}
              to={`/${page.path}`}
            >
              {page.title}
            </NavLink>
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
  catalog.innerHTML = arkComponentCatalog.map(component => `<span class="catalog-item">${component.name}</span>`).join('')
}

const app = document.getElementById('app')
const runtime = globalThis as typeof globalThis & { __uiLibraryPlaygroundRoot?: Root }
if (app) {
  runtime.__uiLibraryPlaygroundRoot ??= createRoot(app)
  runtime.__uiLibraryPlaygroundRoot.render(<App />)
}
