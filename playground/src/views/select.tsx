import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HSelect } from '@demo/ui-react'
import { HSelect as VueHSelect } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const items = [
  { value: 'a', label: 'Zone A' },
  { value: 'b', label: 'Zone B' },
  { value: 'c', label: 'Zone C' },
]

const VueSelectDemo = defineComponent({
  name: 'VueSelectDemo',
  setup() {
    const value = ref('a')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHSelect, {
        label: 'Work area',
        items,
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Selected: ${value.value}`),
    ])
  },
})

function SelectWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-select label="Work area" placeholder="Pick zone" default-value="a" items='${JSON.stringify(items)}' style="width:100%"></h-select>
           <span class="demo-result">Selected: a</span>`,
          host => {
            const el = host.querySelector('h-select') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: string }) => {
              out.textContent = `Selected: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function SelectView() {
  const [value, setValue] = useState('a')
  const definition: ViewDefinition = {
    apiKey: 'select',
    title: 'Select',
    description: 'Single-select. React/WC: onValueChange({ value }); Vue: update:value / value-change.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HSelect label="Work area" items={items} value={value} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Selected: {value}</span>
      </div>
    ),
    vueDemo: VueSelectDemo,
    webDemo: <SelectWebDemo />,
  }
  return <ComponentPage {...definition} />
}
