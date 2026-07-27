import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HButton, HTooltip } from '@demo/ui-react'
import { HButton as VueHButton, HTooltip as VueHTooltip } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueTooltipDemo = defineComponent({
  name: 'VueTooltipDemo',
  setup() {
    const open = ref(false)
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHTooltip, {
        content: 'Industrial tooltip',
        'onOpen-change': (d: { open: boolean }) => { open.value = d.open },
      }, {
        default: () => h(VueHButton, { variant: 'secondary' }, { default: () => 'Hover me' }),
      }),
      h('span', { class: 'demo-result' }, `Open: ${String(open.value)}`),
    ])
  },
})

function TooltipWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-tooltip content="Industrial tooltip">
             <button type="button" class="ui-button ui-button--secondary">Hover me</button>
           </h-tooltip>
           <span class="demo-result">Open: false</span>`,
          host => {
            const el = host.querySelector('h-tooltip') as any
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

export default function TooltipView() {
  const [open, setOpen] = useState(false)
  const definition: ViewDefinition = {
    apiKey: 'tooltip',
    title: 'Tooltip',
    description: 'React/WC: onOpenChange({ open }); Vue: open-change.',
    reactDemo: (
      <div className="demo-stack">
        <HTooltip content="Industrial tooltip" onOpenChange={d => setOpen(d.open)}>
          <HButton variant="secondary">Hover me</HButton>
        </HTooltip>
        <span className="demo-result">Open: {String(open)}</span>
      </div>
    ),
    vueDemo: VueTooltipDemo,
    webDemo: <TooltipWebDemo />,
  }
  return <ComponentPage {...definition} />
}
