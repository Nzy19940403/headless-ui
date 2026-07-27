import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HSegmentGroup } from '@demo/ui-react'
import { HSegmentGroup as VueHSegmentGroup } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const items = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const VueSegmentDemo = defineComponent({
  name: 'VueSegmentDemo',
  setup() {
    const value = ref('day')
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHSegmentGroup, {
        label: 'Range',
        items,
        value: value.value,
        'onUpdate:value': (v: string) => { value.value = v },
        'onValue-change': (d: { value: string }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Selected: ${value.value}`),
    ])
  },
})

function SegmentWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-segment-group label="Range" default-value="day" items='${JSON.stringify(items)}'></h-segment-group>
           <span class="demo-result">Selected: day</span>`,
          host => {
            const el = host.querySelector('h-segment-group') as any
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

export default function SegmentGroupView() {
  const [value, setValue] = useState('day')
  const definition: ViewDefinition = {
    apiKey: 'segmentGroup',
    title: 'Segment Group',
    description: 'Segmented single-select. React/WC: onValueChange({ value }).',
    reactDemo: (
      <div className="demo-stack">
        <HSegmentGroup label="Range" items={items} value={value} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Selected: {value}</span>
      </div>
    ),
    vueDemo: VueSegmentDemo,
    webDemo: <SegmentWebDemo />,
  }
  return <ComponentPage {...definition} />
}
