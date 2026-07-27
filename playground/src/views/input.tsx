import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HInput } from '@demo/ui-react'
import { HInput as VueHInput } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueInputDemo = defineComponent({
  name: 'VueInputDemo',
  setup() {
    const value = ref('Vue field')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHInput, {
        label: 'Project name',
        placeholder: 'Enter name',
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Value: ${value.value}`),
    ])
  },
})

function InputWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-input label="Project name" placeholder="Enter name" default-value="WC field" style="width:100%"></h-input>
           <span class="demo-result">Value: WC field</span>`,
          host => {
            const el = host.querySelector('h-input') as HTMLElement & {
              onValueChange?: (d: { value: string }) => void
            }
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = d => {
              out.textContent = `Value: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function InputView() {
  const [value, setValue] = useState('React field')
  const definition: ViewDefinition = {
    apiKey: 'input',
    title: 'Input',
    description: 'Text field. React/WC: onValueChange({ value }); Vue: update:value / value-change.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HInput label="Project name" value={value} onValueChange={d => setValue(d.value)} placeholder="Enter name" />
        <span className="demo-result">Value: {value}</span>
      </div>
    ),
    vueDemo: VueInputDemo,
    webDemo: <InputWebDemo />,
  }
  return <ComponentPage {...definition} />
}
