import { createApp, type Component } from 'vue'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { componentApis, type ComponentApiDoc, type ApiField } from '../api-catalog'
import type { ViewDefinition } from './types'

function VuePreview({ component }: { component: Component }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!host.current) return
    const app = createApp(component)
    app.mount(host.current)
    return () => app.unmount()
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
              <td><code>{row.name}</code></td>
              <td><code>{row.type}</code></td>
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
                <td><code>{api.eventMapping.react}</code></td>
                <td><code>{api.eventMapping.vue}</code></td>
                <td><code>{api.eventMapping.webComponent}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}

      {api.notes?.length ? (
        <ul className="api-notes">
          {api.notes.map(note => <li key={note}>{note}</li>)}
        </ul>
      ) : null}
    </section>
  )
}

function AdapterGrid({ reactDemo, vueDemo, webDemo }: Pick<ViewDefinition, 'reactDemo' | 'vueDemo' | 'webDemo'>) {
  return (
    <div className="adapter-grid">
      <article className="adapter-card"><span className="label">React</span><div className="preview">{reactDemo}</div></article>
      <article className="adapter-card"><span className="label">Vue</span><VuePreview component={vueDemo} /></article>
      <article className="adapter-card"><span className="label">Web Component</span><div className="preview">{webDemo}</div></article>
    </div>
  )
}

export function ComponentPage({ title, description, reactDemo, vueDemo, webDemo, examples, apiKey, api }: ViewDefinition) {
  const resolvedApi = api ?? (apiKey ? componentApis[apiKey] : undefined)

  return (
    <>
      <p className="eyebrow">COMPONENT / {title.toUpperCase()}</p>
      <h1>{title}</h1>
      <p className="intro">{description}</p>

      <h2 className="section-title">Live preview</h2>
      <p className="intro intro--tight">Three renderers, one contract. Behavior from Ark UI / Zag; styles from theme tokens.</p>
      {examples?.length ? (
        <div className="example-stack">
          {examples.map(example => (
            <section className="example-card" key={example.title}>
              <div className="example-card__header">
                <h3>{example.title}</h3>
                {example.description ? <p>{example.description}</p> : null}
              </div>
              <AdapterGrid reactDemo={example.reactDemo} vueDemo={example.vueDemo} webDemo={example.webDemo} />
            </section>
          ))}
        </div>
      ) : (
        <AdapterGrid reactDemo={reactDemo} vueDemo={vueDemo} webDemo={webDemo} />
      )}

      {resolvedApi ? <ApiPanel api={resolvedApi} /> : (
        <section className="api-panel api-panel--missing">
          <p className="eyebrow">Public API</p>
          <p>No API catalog entry for this page yet. Add <code>apiKey</code> in the view definition.</p>
        </section>
      )}
    </>
  )
}

export type { ReactNode }
