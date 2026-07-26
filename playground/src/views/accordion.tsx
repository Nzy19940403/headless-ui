import { defineComponent, h } from 'vue'
import { Accordion } from '@demo/ui-react'
import { UiAccordion } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const accordionItems = [
  { value: 'core', title: 'What is Core?', content: 'Core provides reusable interaction behavior.' },
  { value: 'renderer', title: 'What is Renderer?', content: 'Renderer turns behavior into framework-specific DOM.' },
]

const VueAccordionDemo = defineComponent({
  name: 'VueAccordionDemo',
  setup: () => () => h(UiAccordion, { multiple: true, items: accordionItems }),
})

function AccordionWebDemo() {
  return (
    <ui-accordion multiple>
      <div data-part="item" data-value="core">
        <h3><button data-part="trigger">What is Core?<span data-part="indicator">+</span></button></h3>
        <div data-part="content">Shared behavior comes from Zag.</div>
      </div>
      <div data-part="item" data-value="renderer">
        <h3><button data-part="trigger">What is Renderer?<span data-part="indicator">+</span></button></h3>
        <div data-part="content">The page owns this content.</div>
      </div>
    </ui-accordion>
  )
}

export default function AccordionView() {
  const definition: ViewDefinition = {
    title: 'Accordion',
    description: 'Expand and collapse related content.',
    reactDemo: <Accordion multiple items={accordionItems} />,
    vueDemo: VueAccordionDemo,
    webDemo: <AccordionWebDemo />,
  }
  return <ComponentPage {...definition} />
}
