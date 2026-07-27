import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HDrawer, HButton, HTag } from '@demo/ui-react'
import { HDrawer as VueHDrawer } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import type { DrawerPlacement } from '@demo/ui-core'

const VueDrawerDemo = defineComponent({
  name: 'VueDrawerDemo',
  setup() {
    const open = ref(false)
    return () =>
      h('div', { class: 'demo-stack' }, [
        h(
          VueHDrawer,
          {
            trigger: 'Open drawer (right)',
            title: 'Asset detail',
            description: 'Vue · Ark Drawer · placement right',
            placement: 'right',
            size: '380px',
            open: open.value,
            'onOpen-change': (d: { open: boolean }) => {
              open.value = d.open
            },
          },
          {
            default: () =>
              h('div', { class: 'demo-stack' }, [
                h('p', { class: 'demo-result' }, 'Side panel for filters, detail, or forms.'),
                h('span', { class: 'demo-result' }, `Open: ${String(open.value)}`),
              ]),
          },
        ),
      ])
  },
})

function DrawerWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-drawer placement="right" size="360px">
             <button data-part="trigger" type="button" class="ui-button ui-button--secondary">Open drawer</button>
             <div data-part="backdrop" class="ui-drawer__backdrop"></div>
             <div data-part="positioner" class="ui-drawer__positioner ui-drawer__positioner--right">
               <div data-part="content" class="ui-drawer__content ui-drawer__content--right" style="--ui-drawer-size:360px" data-placement="right">
                 <header class="ui-drawer__header">
                   <h2 data-part="title" class="ui-drawer__title">Web Component drawer</h2>
                   <button data-part="close-trigger" type="button" class="ui-button ui-button--ghost">Close</button>
                 </header>
                 <p data-part="description" class="ui-drawer__description">Zag drawer machine · light DOM parts.</p>
                 <div class="ui-drawer__body"><p class="demo-result">Detail body in light DOM.</p></div>
               </div>
             </div>
           </h-drawer>
           <span class="demo-result">Open: false</span>`,
          host => {
            const el = host.querySelector('h-drawer') as HTMLElement & {
              onOpenChange?: (d: { open: boolean }) => void
            }
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onOpenChange = (d: { open: boolean }) => {
              out.textContent = `Open: ${String(d.open)}`
            }
          },
        )
      }}
    />
  )
}

export default function DrawerView() {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<DrawerPlacement>('right')

  const definition: ViewDefinition = {
    apiKey: 'drawer',
    title: 'Drawer',
    description:
      'Edge panel (Ark/Zag Drawer). placement: left | right | top | bottom. React/WC: onOpenChange; Vue: open-change.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%', alignItems: 'stretch' }}>
        <div className="tag-demo-row">
          {(['left', 'right', 'top', 'bottom'] as DrawerPlacement[]).map(p => (
            <HButton
              key={p}
              size="sm"
              variant={placement === p ? 'primary' : 'secondary'}
              onClick={() => setPlacement(p)}
            >
              {p}
            </HButton>
          ))}
        </div>
        <HDrawer
          key={placement}
          trigger={`Open drawer (${placement})`}
          title="Inspection detail"
          description={`Placement “${placement}” · size 360px (width or height by axis).`}
          placement={placement}
          size="360px"
          open={open}
          onOpenChange={d => setOpen(d.open)}
        >
          <div className="demo-stack">
            <p className="demo-result">
              Use for asset detail, filters, or mobile nav. Built with the shared theme tokens.
            </p>
            <HTag tone="info">KOMTRAX sample</HTag>
            <span className="demo-result">Open: {String(open)}</span>
          </div>
        </HDrawer>
      </div>
    ),
    vueDemo: VueDrawerDemo,
    webDemo: <DrawerWebDemo />,
  }
  return <ComponentPage {...definition} />
}
