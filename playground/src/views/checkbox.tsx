import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { Checkbox } from '@demo/ui-react'
import { UiCheckbox } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueCheckboxDemo = defineComponent({
  name: 'VueCheckboxDemo',
  setup() {
    const checked = ref(false)

    return () => h(UiCheckbox, {
      label: 'Remember me',
      checked: checked.value,
      'onUpdate:checked': (value: boolean) => { checked.value = value },
    })
  },
})

function CheckboxWebDemo() {
  return (
    <ui-checkbox>
      <span data-part="control"><span data-part="indicator">✓</span></span>
      <span data-part="label">Remember me</span>
      <input data-part="hidden-input" />
    </ui-checkbox>
  )
}

export default function CheckboxView() {
  const [checked, setChecked] = useState(false)
  const definition: ViewDefinition = {
    title: 'Checkbox',
    description: 'A selectable boolean control.',
    reactDemo: <Checkbox label="Remember me" checked={checked} onCheckedChange={setChecked} />,
    vueDemo: VueCheckboxDemo,
    webDemo: <CheckboxWebDemo />,
  }
  return <ComponentPage {...definition} />
}
