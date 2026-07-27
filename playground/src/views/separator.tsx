import { defineComponent, h } from 'vue'
import { HSeparator } from '@demo/ui-react'
import { HSeparator as VueHSeparator } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueSeparatorDemo = defineComponent({
  name: 'VueSeparatorDemo',
  setup: () => () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
    h('span', 'Above'),
    h(VueHSeparator),
    h('span', 'Below'),
  ]),
})

export default function SeparatorView() {
  const definition: ViewDefinition = {
    apiKey: 'separator',
    title: 'Separator',
    description: 'Visual divider between content blocks.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <span>Above</span>
        <HSeparator />
        <span>Below</span>
      </div>
    ),
    vueDemo: VueSeparatorDemo,
    webDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <span>Above</span>
        <h-separator />
        <span>Below</span>
      </div>
    ),
  }
  return <ComponentPage {...definition} />
}
