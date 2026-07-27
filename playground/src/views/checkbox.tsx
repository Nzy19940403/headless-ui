import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HCheckbox } from '@demo/ui-react'
import { HCheckbox as VueHCheckbox } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueCheckboxDemo = defineComponent({
  name: 'VueCheckboxDemo',
  setup() {
    const checked = ref(false)
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHCheckbox, {
        label: 'Remember me',
        checked: checked.value,
        'onChecked-change': (details: { checked: boolean }) => { checked.value = details.checked },
      }),
      h('span', { class: 'demo-result' }, `Checked: ${String(checked.value)}`),
    ])
  },
})

function CheckboxWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-checkbox label="Remember me">
             <span data-part="control"><span data-part="indicator">✓</span></span>
             <span data-part="label">Remember me</span>
             <input data-part="hidden-input" />
           </h-checkbox>
           <span class="demo-result">Checked: false</span>`,
          host => {
            const el = host.querySelector('h-checkbox') as any
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

export default function CheckboxView() {
  const [checked, setChecked] = useState(false)
  const definition: ViewDefinition = {
    apiKey: 'checkbox',
    title: 'Checkbox',
    description: 'React/WC: onCheckedChange({ checked }); Vue: checked-change.',
    reactDemo: (
      <div className="demo-stack">
        <HCheckbox label="Remember me" checked={checked} onCheckedChange={d => setChecked(d.checked)} />
        <span className="demo-result">Checked: {String(checked)}</span>
      </div>
    ),
    vueDemo: VueCheckboxDemo,
    webDemo: <CheckboxWebDemo />,
  }
  return <ComponentPage {...definition} />
}
