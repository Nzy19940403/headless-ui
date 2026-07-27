import { defineComponent, h } from 'vue'
import { HProgress } from '@demo/ui-react'
import { HProgress as VueHProgress } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueProgressDemo = defineComponent({
  name: 'VueProgressDemo',
  setup: () => () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
    h(VueHProgress, { label: 'Load', value: 64 }),
  ]),
})

export default function ProgressView() {
  const definition: ViewDefinition = {
    apiKey: 'progress',
    title: 'Progress',
    description: 'Linear progress for tasks and metrics.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HProgress label="Load" value={64} />
      </div>
    ),
    vueDemo: VueProgressDemo,
    webDemo: <h-progress label="Load" value="64" style={{ width: '100%' }} />,
  }
  return <ComponentPage {...definition} />
}
