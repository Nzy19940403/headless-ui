import { defineComponent, h } from 'vue'
import { Tag } from '@demo/ui-react'
import { UiTag } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const tones = ['neutral', 'success', 'warning', 'danger', 'info'] as const

const VueTagDemo = defineComponent({
  name: 'VueTagDemo',
  setup: () => () => h('div', { class: 'tag-demo-row' }, tones.map(tone => h(UiTag, { tone }, { default: () => tone }))),
})

function TagWebDemo() {
  return <div className="tag-demo-row">{tones.map(tone => <ui-tag key={tone} tone={tone}>{tone}</ui-tag>)}</div>
}

export default function TagView() {
  const definition: ViewDefinition = {
    title: 'Tag',
    description: 'A compact status label for business metadata.',
    reactDemo: <div className="tag-demo-row">{tones.map(tone => <Tag key={tone} tone={tone}>{tone}</Tag>)}</div>,
    vueDemo: VueTagDemo,
    webDemo: <TagWebDemo />,
  }
  return <ComponentPage {...definition} />
}
