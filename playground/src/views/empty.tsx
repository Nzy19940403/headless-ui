import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HButton, HEmpty } from '@demo/ui-react'
import { HButton as VueHButton, HEmpty as VueHEmpty } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueEmptyDemo = defineComponent({
  name: 'VueEmptyDemo',
  setup() {
    const status = ref('Idle — click Add device')
    const count = ref(0)
    return () => h('div', { class: 'demo-stack', style: 'width:100%' }, [
      h(VueHEmpty, {
        title: 'No devices',
        description: 'Connect a sensor to start monitoring.',
      }, {
        default: () => h(VueHButton, {
          size: 'sm',
          onClick: () => {
            count.value += 1
            status.value = `Device invite sent (#${count.value})`
          },
        }, { default: () => 'Add device' }),
      }),
      h('span', { class: 'demo-result' }, status.value),
    ])
  },
})

function EmptyWebDemo() {
  const [status, setStatus] = useState('Idle — click Add device')
  const [count, setCount] = useState(0)

  return (
    <div className="demo-stack" style={{ width: '100%' }}>
      <h-empty title="No devices" description="Connect a sensor to start monitoring.">
        <button
          type="button"
          className="ui-button ui-button--sm"
          onClick={() => {
            const next = count + 1
            setCount(next)
            setStatus(`Device invite sent (#${next})`)
          }}
        >
          Add device
        </button>
      </h-empty>
      <span className="demo-result">{status}</span>
    </div>
  )
}

export default function EmptyView() {
  const [status, setStatus] = useState('Idle — click Add device')
  const [count, setCount] = useState(0)

  const definition: ViewDefinition = {
    apiKey: 'empty',
    title: 'Empty',
    description: 'Empty-state panel. Action area is just a slot — your button must own the click handler.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%' }}>
        <HEmpty title="No devices" description="Connect a sensor to start monitoring.">
          <HButton
            size="sm"
            onClick={() => {
              const next = count + 1
              setCount(next)
              setStatus(`Device invite sent (#${next})`)
            }}
          >
            Add device
          </HButton>
        </HEmpty>
        <span className="demo-result">{status}</span>
      </div>
    ),
    vueDemo: VueEmptyDemo,
    webDemo: <EmptyWebDemo />,
  }
  return <ComponentPage {...definition} />
}
