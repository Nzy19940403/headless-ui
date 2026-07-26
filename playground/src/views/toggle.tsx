import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { Toggle } from '@demo/ui-react'
import UiToggle from '@demo/ui-vue/UiToggle.vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueToggleDemo = defineComponent({
  name: 'VueToggleDemo',
  setup() {
    const checked = ref(false)

    return () => h(UiToggle, {
      checked: checked.value,
      'onUpdate:checked': (value: boolean) => { checked.value = value },
    }, { default: () => 'Enable feature' })
  },
})

function ToggleWebDemo() {
  return (
    <ui-toggle>
      <input data-part="hidden-input" />
      <button data-part="control" type="button"><span data-part="thumb" /></button>
      <span data-part="label">Enable feature</span>
    </ui-toggle>
  )
}

export default function ToggleView() {
  const [checked, setChecked] = useState(false)
  const definition: ViewDefinition = {
    title: 'Toggle',
    description: 'A persistent on/off control.',
    reactDemo: <Toggle checked={checked} onCheckedChange={setChecked}>Enable feature</Toggle>,
    vueDemo: VueToggleDemo,
    webDemo: <ToggleWebDemo />,
  }
  return <ComponentPage {...definition} />
}
