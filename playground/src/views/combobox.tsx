import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HCombobox } from '@demo/ui-react'
import { HCombobox as VueHCombobox } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const items = [
  { value: 'cn', label: 'China' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
]

const VueComboboxDemo = defineComponent({
  name: 'VueComboboxDemo',
  setup() {
    const value = ref('cn')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHCombobox, {
        label: 'Country',
        items,
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Selected: ${value.value}`),
    ])
  },
})

function ComboboxWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-combobox label="Country" default-value="cn" items='${JSON.stringify(items)}' style="width:100%"></h-combobox>
           <span class="demo-result">Selected: cn</span>`,
          host => {
            const el = host.querySelector('h-combobox') as any
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

export default function ComboboxView() {
  const [value, setValue] = useState('cn')
  const definition: ViewDefinition = {
    apiKey: 'combobox',
    title: 'Combobox',
    description: 'Searchable single-select. React/WC: onValueChange({ value }).',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HCombobox label="Country" items={items} value={value} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Selected: {value}</span>
      </div>
    ),
    vueDemo: VueComboboxDemo,
    webDemo: <ComboboxWebDemo />,
  }
  return <ComponentPage {...definition} />
}
