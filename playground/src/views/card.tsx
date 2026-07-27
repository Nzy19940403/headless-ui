import { defineComponent, h } from 'vue'
import { HCard, HTag } from '@demo/ui-react'
import { HCard as VueHCard, HTag as VueHTag } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueCardDemo = defineComponent({
  name: 'VueCardDemo',
  setup: () => () => h(VueHCard, { title: 'Generated card', description: 'Vue renderer uses the same card skin.' }, {
    default: () => h('div', { class: 'demo-stack' }, [
      h(VueHTag, { tone: 'info' }, { default: () => 'Vue' }),
      h('span', { class: 'demo-result' }, 'Business content lives in the slot.'),
    ]),
  }),
})

function CardWebDemo() {
  return (
    <h-card>
      <header className="ui-card__header">
        <h3 className="ui-card__title">Generated card</h3>
        <p className="ui-card__description">Web Component renderer uses the same card skin.</p>
      </header>
      <div className="demo-stack">
        <h-tag tone="info">Web Component</h-tag>
        <span className="demo-result">Business content lives in light DOM.</span>
      </div>
    </h-card>
  )
}

export default function CardView() {
  const definition: ViewDefinition = {
    apiKey: 'card',
    title: 'Card',
    description: 'A surface component for grouping business content.',
    reactDemo: (
      <HCard title="Generated card" description="React renderer uses the same card skin.">
        <div className="demo-stack">
          <HTag tone="info">React</HTag>
          <span className="demo-result">Business content lives in children.</span>
        </div>
      </HCard>
    ),
    vueDemo: VueCardDemo,
    webDemo: <CardWebDemo />,
  }
  return <ComponentPage {...definition} />
}
