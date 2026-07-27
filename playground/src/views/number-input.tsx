import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HNumberInput } from '@demo/ui-react'
import { HNumberInput as VueHNumberInput } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueNumberDemo = defineComponent({
  name: 'VueNumberDemo',
  setup() {
    const value = ref('3')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHNumberInput, {
        label: 'Quantity',
        value: value.value,
        min: 0,
        max: 99,
        step: 1,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Value: ${value.value}`),
    ])
  },
})

function NumberWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-number-input label="Quantity" default-value="3" min="0" max="99" step="1" style="width:100%"></h-number-input>
           <span class="demo-result">Value: 3</span>`,
          host => {
            const el = host.querySelector('h-number-input') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: string }) => {
              out.textContent = `Value: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function NumberInputView() {
  const [value, setValue] = useState('3')
  const definition: ViewDefinition = {
    apiKey: 'numberInput',
    title: 'Number Input',
    description: 'Numeric field with steppers. React/WC: onValueChange({ value: string }).',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HNumberInput label="Quantity" value={value} min={0} max={99} step={1} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Value: {value}</span>
      </div>
    ),
    vueDemo: VueNumberDemo,
    webDemo: <NumberWebDemo />,
  }
  return <ComponentPage {...definition} />
}
