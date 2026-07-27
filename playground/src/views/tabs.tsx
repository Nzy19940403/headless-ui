import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HTabs } from '@demo/ui-react'
import { HTabs as VueHTabs } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const tabItems = [
  { value: 'overview', label: 'Overview', content: 'Overview content.' },
  { value: 'details', label: 'Details', content: 'Details content.' },
]

const VueTabsDemo = defineComponent({
  name: 'VueTabsDemo',
  setup() {
    const value = ref('overview')
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHTabs, {
        value: value.value,
        items: tabItems,
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Active: ${value.value}`),
    ])
  },
})

function TabsWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-tabs default-value="overview">
             <div data-part="list">
               <button data-part="trigger" data-value="overview" type="button">Overview</button>
               <button data-part="trigger" data-value="details" type="button">Details</button>
             </div>
             <div data-part="content" data-value="overview">Overview content.</div>
             <div data-part="content" data-value="details">Details content.</div>
           </h-tabs>
           <span class="demo-result">Active: overview</span>`,
          host => {
            const el = host.querySelector('h-tabs') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: string }) => {
              out.textContent = `Active: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function TabsView() {
  const [value, setValue] = useState('overview')
  const definition: ViewDefinition = {
    apiKey: 'tabs',
    title: 'Tabs',
    description: 'React/WC: onValueChange({ value }); Vue: value-change.',
    reactDemo: (
      <div className="demo-stack">
        <HTabs value={value} items={tabItems} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Active: {value}</span>
      </div>
    ),
    vueDemo: VueTabsDemo,
    webDemo: <TabsWebDemo />,
  }
  return <ComponentPage {...definition} />
}
