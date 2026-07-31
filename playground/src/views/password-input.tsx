import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HPasswordInput } from '@demo/ui-react'
import { HPasswordInput as VueHPasswordInput } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VuePasswordDemo = defineComponent({
  name: 'VuePasswordDemo',
  setup() {
    const value = ref('')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHPasswordInput, {
        label: 'Password',
        placeholder: 'Enter password',
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Length: ${value.value.length}`),
    ])
  },
})

function PasswordWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-password-input label="Password" placeholder="Enter password" style="width:100%"></h-password-input>
           <span class="demo-result">Length: 0</span>`,
          host => {
            const el = host.querySelector('h-password-input') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: string }) => {
              out.textContent = `Length: ${d.value.length}`
            }
          },
        )
      }}
    />
  )
}

export default function PasswordInputView() {
  const [value, setValue] = useState('')
  const definition: ViewDefinition = {
    apiKey: 'passwordInput',
    title: 'Password Input',
    description: 'Password with show/hide. React/WC: onValueChange({ value }).',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HPasswordInput label="Password" value={value} onValueChange={d => setValue(d.value as string)} placeholder="Enter password" />
        <span className="demo-result">Length: {value.length}</span>
      </div>
    ),
    vueDemo: VuePasswordDemo,
    webDemo: <PasswordWebDemo />,
  }
  return <ComponentPage {...definition} />
}
