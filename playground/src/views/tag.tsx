import { defineComponent, h } from 'vue'
import { HTag } from '@demo/ui-react'
import { HTag as VueHTag } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const tones = ['neutral', 'success', 'warning', 'danger', 'info'] as const

const VueTagDemo = defineComponent({
  name: 'VueTagDemo',
  setup: () => () => h('div', { class: 'tag-demo-row' }, tones.map(tone => h(VueHTag, { tone }, { default: () => tone }))),
})

function TagWebDemo() {
  return <div className="tag-demo-row">{tones.map(tone => <h-tag key={tone} tone={tone}>{tone}</h-tag>)}</div>
}

export default function TagView() {
  const definition: ViewDefinition = {
    apiKey: 'tag',
    title: 'Tag',
    description: 'A compact status label for business metadata.',
    reactDemo: <div className="tag-demo-row">{tones.map(tone => <HTag key={tone} tone={tone}>{tone}</HTag>)}</div>,
    vueDemo: VueTagDemo,
    webDemo: <TagWebDemo />,
  }
  return <ComponentPage {...definition} />
}
