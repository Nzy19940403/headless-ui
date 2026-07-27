import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HRadioGroup } from '@demo/ui-react'
import { HRadioGroup as VueHRadioGroup } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const items = [
  { value: 'day', label: 'Day shift' },
  { value: 'night', label: 'Night shift' },
]

const VueRadioDemo = defineComponent({
  name: 'VueRadioDemo',
  setup() {
    const value = ref('day')
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHRadioGroup, {
        label: 'Shift',
        items,
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Selected: ${value.value}`),
    ])
  },
})

function RadioWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-radio-group label="Shift" default-value="day" items='${JSON.stringify(items)}'></h-radio-group>
           <span class="demo-result">Selected: day</span>`,
          host => {
            const el = host.querySelector('h-radio-group') as any
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

export default function RadioView() {
  const [value, setValue] = useState('day')
  const definition: ViewDefinition = {
    apiKey: 'radio',
    title: 'Radio Group',
    description: 'React/WC: onValueChange({ value }); Vue: update:value / value-change.',
    reactDemo: (
      <div className="demo-stack">
        <HRadioGroup label="Shift" items={items} value={value} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Selected: {value}</span>
      </div>
    ),
    vueDemo: VueRadioDemo,
    webDemo: <RadioWebDemo />,
  }
  return <ComponentPage {...definition} />
}
