import { defineComponent, h } from 'vue'
import { Dialog } from '@demo/ui-react'
import { UiDialog } from '@demo/ui-vue'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueDialogDemo = defineComponent({
  name: 'VueDialogDemo',
  setup: () => () => h(UiDialog, {
    trigger: 'Open dialog',
    title: 'Ark UI Dialog',
    description: 'Behavior comes from Ark UI/Zag; styles come from our renderer.',
  }),
})

function DialogWebDemo() {
  return (
    <ui-dialog>
      <button data-part="trigger" className="ui-button ui-button--secondary">Open dialog</button>
      <div data-part="backdrop" />
      <div data-part="positioner">
        <div data-part="content">
          <h2 data-part="title">Web Component dialog</h2>
          <p data-part="description">Content supplied by the page.</p>
          <button data-part="close-trigger" className="ui-button ui-button--secondary">Close</button>
        </div>
      </div>
    </ui-dialog>
  )
}

export default function DialogView() {
  const definition: ViewDefinition = {
    title: 'Dialog',
    description: 'A modal surface with focus management.',
    reactDemo: <Dialog trigger="Open dialog" title="Ark UI Dialog" description="Behavior comes from Ark UI/Zag; styles come from our renderer." />,
    vueDemo: VueDialogDemo,
    webDemo: <DialogWebDemo />,
  }
  return <ComponentPage {...definition} />
}
