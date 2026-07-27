import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HToggle } from '@demo/ui-react'
import VueHToggle from '@demo/ui-vue/HToggle.vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueToggleDemo = defineComponent({
  name: 'VueToggleDemo',
  setup() {
    const checked = ref(false)
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHToggle, {
        checked: checked.value,
        'onChecked-change': (details: { checked: boolean }) => { checked.value = details.checked },
      }, { default: () => 'Enable feature' }),
      h('span', { class: 'demo-result' }, `Checked: ${String(checked.value)}`),
    ])
  },
})

function ToggleWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-toggle>
             <input data-part="hidden-input" />
             <button data-part="control" type="button"><span data-part="thumb"></span></button>
             <span data-part="label">Enable feature</span>
           </h-toggle>
           <span class="demo-result">Checked: false</span>`,
          host => {
            const el = host.querySelector('h-toggle') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onCheckedChange = (d: { checked: boolean }) => {
              out.textContent = `Checked: ${String(d.checked)}`
            }
          },
        )
      }}
    />
  )
}

export default function ToggleView() {
  const [checked, setChecked] = useState(false)
  const definition: ViewDefinition = {
    apiKey: 'toggle',
    title: 'Toggle',
    description: 'React/WC: onCheckedChange({ checked }); Vue: checked-change.',
    reactDemo: (
      <div className="demo-stack">
        <HToggle checked={checked} onCheckedChange={d => setChecked(d.checked)}>Enable feature</HToggle>
        <span className="demo-result">Checked: {String(checked)}</span>
      </div>
    ),
    vueDemo: VueToggleDemo,
    webDemo: <ToggleWebDemo />,
  }
  return <ComponentPage {...definition} />
}
