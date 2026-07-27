import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HAccordion } from '@demo/ui-react'
import { HAccordion as VueHAccordion } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const accordionItems = [
  { value: 'core', title: 'What is Core?', content: 'Core provides reusable interaction behavior.' },
  { value: 'renderer', title: 'What is Renderer?', content: 'Renderer turns behavior into framework-specific DOM.' },
]

const VueAccordionDemo = defineComponent({
  name: 'VueAccordionDemo',
  setup() {
    const value = ref<string[]>([])
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHAccordion, {
        multiple: true,
        items: accordionItems,
        value: value.value,
        'onValue-change': (d: { value: string[] }) => { value.value = d.value },
      }),
      h('span', { class: 'demo-result' }, `Open: ${value.value.join(', ') || '(none)'}`),
    ])
  },
})

function AccordionWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-accordion multiple>
             <div data-part="item" data-value="core">
               <h3><button data-part="trigger" type="button">What is Core?<span data-part="indicator">+</span></button></h3>
               <div data-part="content">Shared behavior comes from Zag.</div>
             </div>
             <div data-part="item" data-value="renderer">
               <h3><button data-part="trigger" type="button">What is Renderer?<span data-part="indicator">+</span></button></h3>
               <div data-part="content">The page owns this content.</div>
             </div>
           </h-accordion>
           <span class="demo-result">Open: (none)</span>`,
          host => {
            const el = host.querySelector('h-accordion') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = (d: { value: string[] }) => {
              out.textContent = `Open: ${d.value?.join(', ') || '(none)'}`
            }
          },
        )
      }}
    />
  )
}

export default function AccordionView() {
  const [value, setValue] = useState<string[]>([])
  const definition: ViewDefinition = {
    apiKey: 'accordion',
    title: 'Accordion',
    description: 'React/WC: onValueChange({ value: string[] }); Vue: value-change.',
    reactDemo: (
      <div className="demo-stack">
        <HAccordion multiple items={accordionItems} value={value} onValueChange={d => setValue(d.value)} />
        <span className="demo-result">Open: {value.join(', ') || '(none)'}</span>
      </div>
    ),
    vueDemo: VueAccordionDemo,
    webDemo: <AccordionWebDemo />,
  }
  return <ComponentPage {...definition} />
}
