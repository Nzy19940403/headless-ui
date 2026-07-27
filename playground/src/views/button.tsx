import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HButton } from '@demo/ui-react'
import VueHButton from '@demo/ui-vue/HButton.vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueButtonDemo = defineComponent({
  name: 'VueButtonDemo',
  setup() {
    const clicks = ref(0)

    return () => h('div', { class: 'demo-stack' }, [
      h(VueHButton, { onClick: () => { clicks.value += 1 } }, { default: () => 'Primary action' }),
      h('span', { class: 'demo-result' }, `Clicked ${clicks.value} times`),
    ])
  },
})

function ButtonWebDemo() {
  const [clicks, setClicks] = useState(0)

  return (
    <div className="demo-stack">
      <h-button onClick={() => setClicks(value => value + 1)}>Primary action</h-button>
      <span className="demo-result">Clicked {clicks} times</span>
    </div>
  )
}

export default function ButtonView() {
  const [clicks, setClicks] = useState(0)

  const definition: ViewDefinition = {
    apiKey: 'button',
    title: 'Button',
    description: 'A command component with the same public contract across React, Vue, and Web Component render layers.',
    reactDemo: (
      <div className="demo-stack">
        <HButton onClick={() => setClicks(value => value + 1)}>Primary action</HButton>
        <span className="demo-result">Clicked {clicks} times</span>
      </div>
    ),
    vueDemo: VueButtonDemo,
    webDemo: <ButtonWebDemo />,
  }

  return <ComponentPage {...definition} />
}
