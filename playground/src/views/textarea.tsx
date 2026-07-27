import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HTextarea } from '@demo/ui-react'
import { HTextarea as VueHTextarea } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueTextareaDemo = defineComponent({
  name: 'VueTextareaDemo',
  setup() {
    const value = ref('Vue notes')
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHTextarea, {
        label: 'Notes',
        placeholder: 'Write something…',
        value: value.value,
        rows: 3,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Value: ${value.value}`),
    ])
  },
})

function TextareaWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%' }}
      ref={root => {
        mountWc(
          root,
          `<h-textarea label="Notes" placeholder="Write something…" default-value="WC notes" rows="3" style="width:100%"></h-textarea>
           <span class="demo-result">Value: WC notes</span>`,
          host => {
            const el = host.querySelector('h-textarea') as any
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

export default function TextareaView() {
  const [value, setValue] = useState('React notes')
  const definition: ViewDefinition = {
    apiKey: 'textarea',
    title: 'Textarea',
    description: 'Multi-line text. React/WC: onValueChange({ value }); Vue: update:value / value-change.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HTextarea label="Notes" value={value} onValueChange={d => setValue(d.value)} rows={3} placeholder="Write something…" />
        <span className="demo-result">Value: {value}</span>
      </div>
    ),
    vueDemo: VueTextareaDemo,
    webDemo: <TextareaWebDemo />,
  }
  return <ComponentPage {...definition} />
}
