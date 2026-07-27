import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HDialog } from '@demo/ui-react'
import { HDialog as VueHDialog } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'

const VueDialogDemo = defineComponent({
  name: 'VueDialogDemo',
  setup() {
    const open = ref(false)
    return () => h('div', { class: 'demo-stack' }, [
      h(VueHDialog, {
        trigger: 'Open dialog',
        title: 'Ark UI Dialog',
        description: 'Behavior comes from Ark UI/Zag; styles come from our renderer.',
        open: open.value,
        'onOpen-change': (d: { open: boolean }) => { open.value = d.open },
      }),
      h('span', { class: 'demo-result' }, `Open: ${String(open.value)}`),
    ])
  },
})

function DialogWebDemo() {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `<h-dialog>
             <button data-part="trigger" type="button" class="ui-button ui-button--secondary">Open dialog</button>
             <div data-part="backdrop" class="ui-dialog__backdrop"></div>
             <div data-part="positioner" class="ui-dialog__positioner">
               <div data-part="content" class="dialog-content ui-dialog__content">
                 <h2 data-part="title" class="ui-dialog__title">Web Component dialog</h2>
                 <p data-part="description" class="ui-dialog__description">Content supplied by the page.</p>
                 <button data-part="close-trigger" type="button" class="ui-button ui-button--secondary">Close</button>
               </div>
             </div>
           </h-dialog>
           <span class="demo-result">Open: false</span>`,
          host => {
            const el = host.querySelector('h-dialog') as any
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onOpenChange = (d: { open: boolean }) => {
              out.textContent = `Open: ${String(d.open)}`
            }
          },
        )
      }}
    />
  )
}

export default function DialogView() {
  const [open, setOpen] = useState(false)
  const definition: ViewDefinition = {
    apiKey: 'dialog',
    title: 'Dialog',
    description: 'React/WC: onOpenChange({ open }); Vue: open-change.',
    reactDemo: (
      <div className="demo-stack">
        <HDialog
          trigger="Open dialog"
          title="Ark UI Dialog"
          description="Behavior comes from Ark UI/Zag; styles come from our renderer."
          open={open}
          onOpenChange={d => setOpen(d.open)}
        />
        <span className="demo-result">Open: {String(open)}</span>
      </div>
    ),
    vueDemo: VueDialogDemo,
    webDemo: <DialogWebDemo />,
  }
  return <ComponentPage {...definition} />
}
