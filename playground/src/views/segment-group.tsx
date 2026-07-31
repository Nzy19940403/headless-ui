import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HSegmentGroup, HVStack, HTag, HStack } from '@demo/ui-react'
import { HSegmentGroup as VueHSegmentGroup, HTag as VueHTag } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const rangeItems = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const partialItems = [
  { value: 'edit', label: 'Edit' },
  { value: 'preview', label: 'Preview', disabled: true },
  { value: 'publish', label: 'Publish' },
]

function DemoTags() {
  return (
    <HStack gap="sm" wrap>
      <HTag tone="neutral">disabled · fullWidth · size</HTag>
      <HTag tone="success">onValueChange {'{ value }'}</HTag>
    </HStack>
  )
}

function ReactSegmentDemo() {
  const [value, setValue] = useState('day')
  const [full, setFull] = useState('week')

  return (
    <HVStack gap="lg" className="input-demo" style={{ width: '100%', maxWidth: 480 }}>
      <section className="input-demo-section">
        <h3 className="input-demo-title">Basic (hug content)</h3>
        <HSegmentGroup
          label="Range"
          items={rangeItems}
          value={value}
          onValueChange={d => setValue(d.value)}
        />
        <span className="demo-result">Selected: {value}</span>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Full width</h3>
        <HSegmentGroup
          label="Range (fullWidth)"
          items={rangeItems}
          value={full}
          fullWidth
          onValueChange={d => setFull(d.value)}
        />
        <span className="demo-result">Wrapper fills the parent; segments keep their natural widths</span>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Sizes</h3>
        <HVStack gap="sm">
          <HSegmentGroup label="Small" items={rangeItems} defaultValue="day" size="sm" />
          <HSegmentGroup label="Medium" items={rangeItems} defaultValue="week" size="md" />
          <HSegmentGroup label="Large" items={rangeItems} defaultValue="month" size="lg" />
        </HVStack>
      </section>

      <section className="input-demo-section">
        <h3 className="input-demo-title">Disabled</h3>
        <HVStack gap="sm">
          <HSegmentGroup label="Group disabled" items={rangeItems} defaultValue="day" disabled />
          <HSegmentGroup
            label="Item disabled (Preview)"
            items={partialItems}
            defaultValue="edit"
          />
        </HVStack>
      </section>

      <DemoTags />
    </HVStack>
  )
}

const VueSegmentDemo = defineComponent({
  name: 'VueSegmentDemo',
  setup() {
    const value = ref('day')
    const full = ref('week')
    return () =>
      h('div', { class: 'demo-stack input-demo', style: 'width:100%;max-width:480px' }, [
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Basic (hug content)'),
          h(VueHSegmentGroup, {
            label: 'Range',
            items: rangeItems,
            value: value.value,
            'onUpdate:value': (v: string) => {
              value.value = v
            },
            'onValue-change': (d: { value: string }) => {
              value.value = d.value
            },
          }),
          h('span', { class: 'demo-result' }, `Selected: ${value.value}`),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Full width'),
          h(VueHSegmentGroup, {
            label: 'Range (fullWidth)',
            items: rangeItems,
            value: full.value,
            fullWidth: true,
            'onUpdate:value': (v: string) => {
              full.value = v
            },
            'onValue-change': (d: { value: string }) => {
              full.value = d.value
            },
          }),
          h('span', { class: 'demo-result' }, 'Wrapper fills the parent; segments keep their natural widths'),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Sizes'),
          h(VueHSegmentGroup, {
            label: 'Small',
            items: rangeItems,
            defaultValue: 'day',
            size: 'sm',
          }),
          h(VueHSegmentGroup, {
            label: 'Medium',
            items: rangeItems,
            defaultValue: 'week',
            size: 'md',
          }),
          h(VueHSegmentGroup, {
            label: 'Large',
            items: rangeItems,
            defaultValue: 'month',
            size: 'lg',
          }),
        ]),
        h('section', { class: 'input-demo-section' }, [
          h('h3', { class: 'input-demo-title' }, 'Disabled'),
          h(VueHSegmentGroup, {
            label: 'Group disabled',
            items: rangeItems,
            defaultValue: 'day',
            disabled: true,
          }),
          h(VueHSegmentGroup, {
            label: 'Item disabled (Preview)',
            items: partialItems,
            defaultValue: 'edit',
          }),
        ]),
        h('div', { style: 'display:flex;flex-wrap:wrap;gap:0.5rem' }, [
          h(VueHTag, { tone: 'neutral', content: 'disabled · fullWidth · size' }),
          h(VueHTag, { tone: 'success', content: 'onValueChange { value }' }),
        ]),
      ])
  },
})

function SegmentWebDemo() {
  return (
    <div
      className="demo-stack input-demo"
      style={{ width: '100%', maxWidth: 480 }}
      ref={root => {
        mountWc(
          root,
          `<div class="input-demo-section">
             <h3 class="input-demo-title">Basic (hug content)</h3>
             <h-segment-group id="sg-basic" label="Range" value="day" items='${JSON.stringify(rangeItems)}'></h-segment-group>
             <span class="demo-result" data-out="basic">Selected: day</span>
           </div>
           <div class="input-demo-section">
             <h3 class="input-demo-title">Full width</h3>
          <h-segment-group label="Range (fullWidth)" default-value="week" full-width items='${JSON.stringify(rangeItems)}'></h-segment-group>
             <span class="demo-result">Wrapper fills the parent; segments keep their natural widths</span>
           </div>
           <div class="input-demo-section">
             <h3 class="input-demo-title">Sizes</h3>
             <h-segment-group label="Small" default-value="day" size="sm" items='${JSON.stringify(rangeItems)}'></h-segment-group>
             <h-segment-group label="Medium" default-value="week" size="md" items='${JSON.stringify(rangeItems)}'></h-segment-group>
             <h-segment-group label="Large" default-value="month" size="lg" items='${JSON.stringify(rangeItems)}'></h-segment-group>
           </div>
           <div class="input-demo-section">
             <h3 class="input-demo-title">Disabled</h3>
             <h-segment-group label="Group disabled" default-value="day" disabled items='${JSON.stringify(rangeItems)}'></h-segment-group>
             <h-segment-group label="Item disabled (Preview)" default-value="edit" items='${JSON.stringify(partialItems)}'></h-segment-group>
           </div>`,
          host => {
            const el = host.querySelector('#sg-basic') as HTMLElement & {
              onValueChange?: (d: { value: string }) => void
            }
            const out = host.querySelector('[data-out="basic"]')
            if (!el || !out) return
            el.onValueChange = d => {
              out.textContent = `Selected: ${d.value}`
            }
          },
        )
      }}
    />
  )
}

export default function SegmentGroupView() {
  const definition: ViewDefinition = {
    apiKey: 'segmentGroup',
    title: 'Segment Group',
    description:
      'Segmented single-select: hug content vs fullWidth, sizes, group/item disabled. Same sections on React / Vue / WC.',
    reactDemo: <ReactSegmentDemo />,
    vueDemo: VueSegmentDemo,
    webDemo: <SegmentWebDemo />,
  }
  return <ComponentPage {...definition} />
}
