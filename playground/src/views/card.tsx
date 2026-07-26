import { defineComponent, h } from 'vue'
import { Card, Tag } from '@demo/ui-react'
import { UiCard, UiTag } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueCardDemo = defineComponent({
  name: 'VueCardDemo',
  setup: () => () => h(UiCard, { title: 'Generated card', description: 'Vue renderer uses the same card skin.' }, {
    default: () => h('div', { class: 'demo-stack' }, [
      h(UiTag, { tone: 'info' }, { default: () => 'Vue' }),
      h('span', { class: 'demo-result' }, 'Business content lives in the slot.'),
    ]),
  }),
})

function CardWebDemo() {
  return (
    <ui-card>
      <header className="ui-card__header">
        <h3 className="ui-card__title">Generated card</h3>
        <p className="ui-card__description">Web Component renderer uses the same card skin.</p>
      </header>
      <div className="demo-stack">
        <ui-tag tone="info">Web Component</ui-tag>
        <span className="demo-result">Business content lives in light DOM.</span>
      </div>
    </ui-card>
  )
}

export default function CardView() {
  const definition: ViewDefinition = {
    title: 'Card',
    description: 'A surface component for grouping business content.',
    reactDemo: (
      <Card title="Generated card" description="React renderer uses the same card skin.">
        <div className="demo-stack">
          <Tag tone="info">React</Tag>
          <span className="demo-result">Business content lives in children.</span>
        </div>
      </Card>
    ),
    vueDemo: VueCardDemo,
    webDemo: <CardWebDemo />,
  }
  return <ComponentPage {...definition} />
}
