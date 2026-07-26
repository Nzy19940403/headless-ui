import { createApp, type Component } from 'vue'
import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
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

export function ComponentPage({ title, description, reactDemo, vueDemo, webDemo }: ViewDefinition) {
  return (
    <>
      <p className="eyebrow">COMPONENT / {title.toUpperCase()}</p>
      <h1>{title}</h1>
      <p className="intro">{description} Behavior comes from Ark UI/Zag; each adapter owns its rendering runtime.</p>
      <div className="adapter-grid">
        <article className="adapter-card"><span className="label">React</span><div className="preview">{reactDemo}</div></article>
        <article className="adapter-card"><span className="label">Vue</span><VuePreview component={vueDemo} /></article>
        <article className="adapter-card"><span className="label">Web Component</span><div className="preview">{webDemo}</div></article>
      </div>
      <section className="contract"><h2>Component contract</h2><p>One behavior contract, separate render layers. The page owns content and structure; the adapter supplies framework-specific behavior.</p></section>
    </>
  )
}

export type { ReactNode }
