import { createApp, type Component } from 'vue'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { componentApis, type ComponentApiDoc, type ApiField } from '../api-catalog'
import type { ViewDefinition } from './types'

type AdapterTab = 'react' | 'vue' | 'web'

const ADAPTER_TABS: Array<{ id: AdapterTab; label: string }> = [
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'web', label: 'Web Component' },
]

function VuePreview({ component }: { component: Component }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    let app: ReturnType<typeof createApp> | null = null
    try {
      app = createApp(component)
      app.config.errorHandler = (err, instance, info) => {
        console.error('[Vue error handler]', err, 'info:', info)
        if (err instanceof Error) {
          console.error('[Vue error] message:', err.message)
          console.error('[Vue error] stack:', err.stack)
        }
      }
      app.mount(host.current)
    } catch (err) {
      console.error('[VuePreview mount error]', err)
      if (err instanceof Error) {
        console.error('[VuePreview mount error] message:', err.message)
        console.error('[VuePreview mount error] stack:', err.stack)
      }
    }
    return () => {
      try {
        if (app) app.unmount()
      } catch (err) {
        console.error('[VuePreview unmount error]', err)
      }
    }
  }, [component])
  return <div ref={host} className="preview" />
}

function FieldTable({ title, rows }: { title: string; rows: ApiField[] }) {
  if (!rows.length) return null
  return (
    <div className="api-table-block">
      <h3>{title}</h3>
      <table className="api-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>
                <code>{row.type}</code>
              </td>
              <td>{row.defaultValue ? <code>{row.defaultValue}</code> : '—'}</td>
              <td>{row.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ApiPanel({ api }: { api: ComponentApiDoc }) {
  return (
    <section className="api-panel">
      <div className="api-panel__header">
        <p className="eyebrow">Public API</p>
        <h2>
          <code>{api.contract}</code>
        </h2>
        <p className="api-panel__path">
          Core: <code>{api.contractFile}</code>
        </p>
      </div>

      <FieldTable title="Props" rows={api.props} />
      <FieldTable title="Events" rows={api.events ?? []} />
      <FieldTable title="Slots / children" rows={api.slots ?? []} />

      {api.eventMapping ? (
        <div className="api-table-block">
          <h3>Event mapping (same payload)</h3>
          <table className="api-table">
            <thead>
              <tr>
                <th>React</th>
                <th>Vue</th>
                <th>Web Component</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>{api.eventMapping.react}</code>
                </td>
                <td>
                  <code>{api.eventMapping.vue}</code>
                </td>
                <td>
                  <code>{api.eventMapping.webComponent}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {api.notes?.length ? (
        <ul className="api-notes">
          {api.notes.map(note => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function AdapterTabs({
  reactDemo,
  vueDemo,
  webDemo,
}: Pick<ViewDefinition, 'reactDemo' | 'vueDemo' | 'webDemo'>) {
  const [tab, setTab] = useState<AdapterTab>('react')

  return (
    <div className="adapter-tabs">
      <div className="adapter-tabs__list" role="tablist" aria-label="Renderer">
        {ADAPTER_TABS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            className={`adapter-tabs__tab${tab === item.id ? ' is-active' : ''}`}
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="adapter-tabs__panel" role="tabpanel">
        {/* Mount only the active adapter so demos have full width and clean lifecycle. */}
        {tab === 'react' ? <div className="preview">{reactDemo}</div> : null}
        {tab === 'vue' ? <VuePreview component={vueDemo} /> : null}
        {tab === 'web' ? <div className="preview">{webDemo}</div> : null}
      </div>
    </div>
  )
}

export function ComponentPage({
  title,
  description,
  reactDemo,
  vueDemo,
  webDemo,
  examples,
  apiKey,
  api,
}: ViewDefinition) {
  const resolvedApi = api ?? (apiKey ? componentApis[apiKey] : undefined)

  return (
    <>
      <p className="eyebrow">COMPONENT / {title.toUpperCase()}</p>
      <h1>{title}</h1>
      <p className="intro">{description}</p>

      <h2 className="section-title">Live preview</h2>
      <p className="intro intro--tight">
        Switch React / Vue / Web Component — one Core contract, full-width preview per renderer.
      </p>
      {examples?.length ? (
        <div className="example-stack">
          {examples.map(example => (
            <section className="example-card" key={example.title}>
              <div className="example-card__header">
                <h3>{example.title}</h3>
                {example.description ? <p>{example.description}</p> : null}
              </div>
              <AdapterTabs
                reactDemo={example.reactDemo}
                vueDemo={example.vueDemo}
                webDemo={example.webDemo}
              />
            </section>
          ))}
        </div>
      ) : (
        <AdapterTabs reactDemo={reactDemo} vueDemo={vueDemo} webDemo={webDemo} />
      )}

      {resolvedApi ? (
        <ApiPanel api={resolvedApi} />
      ) : (
        <section className="api-panel api-panel--missing">
          <p className="eyebrow">Public API</p>
          <p>
            No API catalog entry for this page yet. Add <code>apiKey</code> in the view definition.
          </p>
        </section>
      )}
    </>
  )
}

export type { ReactNode }
