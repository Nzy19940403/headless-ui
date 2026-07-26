import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { Button } from '@demo/ui-react'
import UiButton from '@demo/ui-vue/UiButton.vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueButtonDemo = defineComponent({
  name: 'VueButtonDemo',
  setup() {
    const clicks = ref(0)

    return () => h('div', { class: 'demo-stack' }, [
      h(UiButton, { onClick: () => { clicks.value += 1 } }, { default: () => 'Primary action' }),
      h('span', { class: 'demo-result' }, `Clicked ${clicks.value} times`),
    ])
  },
})

function ButtonWebDemo() {
  const [clicks, setClicks] = useState(0)

  return (
    <div className="demo-stack">
      <ui-button onClick={() => setClicks(value => value + 1)}>Primary action</ui-button>
      <span className="demo-result">Clicked {clicks} times</span>
    </div>
  )
}

export default function ButtonView() {
  const [clicks, setClicks] = useState(0)

  const definition: ViewDefinition = {
    title: 'Button',
    description: 'A command component with the same public contract across React, Vue, and Web Component render layers.',
    reactDemo: (
      <div className="demo-stack">
        <Button onClick={() => setClicks(value => value + 1)}>Primary action</Button>
        <span className="demo-result">Clicked {clicks} times</span>
      </div>
    ),
    vueDemo: VueButtonDemo,
    webDemo: <ButtonWebDemo />,
  }

  return <ComponentPage {...definition} />
}
