import { defineComponent, h } from 'vue'
import { HBadge } from '@demo/ui-react'
import { HBadge as VueHBadge } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const tones = ['neutral', 'success', 'warning', 'danger', 'info'] as const

const VueBadgeDemo = defineComponent({
  name: 'VueBadgeDemo',
  setup: () => () => h('div', { class: 'tag-demo-row' }, [
    ...tones.map(tone => h(VueHBadge, { tone }, { default: () => '3' })),
    h(VueHBadge, { tone: 'danger', dot: true }),
  ]),
})

export default function BadgeView() {
  const definition: ViewDefinition = {
    apiKey: 'badge',
    title: 'Badge',
    description: 'Compact count or status mark.',
    reactDemo: (
      <div className="tag-demo-row">
        {tones.map(tone => <HBadge key={tone} tone={tone}>3</HBadge>)}
        <HBadge tone="danger" dot />
      </div>
    ),
    vueDemo: VueBadgeDemo,
    webDemo: (
      <div className="tag-demo-row">
        {tones.map(tone => <h-badge key={tone} tone={tone}>3</h-badge>)}
        <h-badge tone="danger" dot />
      </div>
    ),
  }
  return <ComponentPage {...definition} />
}
