import { Window } from 'happy-dom'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const window = new Window({ url: 'http://localhost/' })
const { document, customElements, HTMLElement, CustomEvent, requestAnimationFrame } = window

// globals zag/vanilla may need
globalThis.window = window
globalThis.document = document
globalThis.HTMLElement = HTMLElement
globalThis.customElements = customElements
globalThis.CustomEvent = CustomEvent
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0)
globalThis.CSS = { escape: s => s.replace(/"/g, '\\"') }
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' })
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Load compiled? We need TS. Use dynamic import via vite SSR.
const { createServer } = await import('vite')
const server = await createServer({
  root: path.resolve('F:/project/ui-library'),
  server: { middlewareMode: true },
  appType: 'custom',
  resolve: {
    alias: {
      '@demo/ui-core': path.resolve('F:/project/ui-library/packages/core/src'),
      '@demo/ui-web-components': path.resolve('F:/project/ui-library/packages/web-components/src'),
    },
  },
})

try {
  await server.ssrLoadModule('/packages/web-components/src/h-tree.ts')
  console.log('registered', !!customElements.get('h-tree'))

  const el = document.createElement('h-tree')
  el.setAttribute('label', 'test')
  el.setAttribute('height', '360')
  el.setAttribute('default-expanded-value', '["s1"]')
  document.body.appendChild(el)

  el.nodes = [
    { id: 's1', label: 'Site 1', children: [{ id: 'a', label: 'Area' }] },
    { id: 's2', label: 'Site 2' },
  ]
  el.refresh?.()

  await new Promise(r => setTimeout(r, 100))

  const spacer = el.querySelector('.ui-tree__virtual-spacer')
  console.log('spacer?', !!spacer)
  console.log('children', spacer?.childElementCount)
  console.log('inner', spacer?.innerHTML?.slice(0, 300))
  console.log('full host children', el.innerHTML.slice(0, 500))
} catch (e) {
  console.error('FAIL', e)
} finally {
  await server.close()
  window.close()
}
