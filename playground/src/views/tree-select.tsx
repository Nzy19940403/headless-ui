import { useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HTreeSelect } from '@demo/ui-react'
import { HTreeSelect as VueHTreeSelect } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { TreeNodeContract } from '@demo/ui-core'
import type { ViewDefinition } from './types'

const nodes: TreeNodeContract[] = [
  {
    id: 'auxiliary-production',
    label: '辅助生产设备',
    children: [
      { id: 'loader', label: '装载机' },
      { id: 'command-vehicle', label: '指挥车' },
    ],
  },
  {
    id: 'refueling-equipment',
    label: '加油设备',
    children: [{ id: 'refuel-truck', label: '加油车' }],
  },
]

const VueTreeSelectDemo = defineComponent({
  name: 'VueTreeSelectDemo',
  setup() {
    const value = ref<string[]>([])
    return () =>
      h('div', { class: 'demo-stack', style: 'width:100%;max-width:420px' }, [
        h(
          VueHTreeSelect,
          {
            label: '设备类型 (Vue)',
            placeholder: '选择设备类型',
            nodes,
            selectBranches: true,
            multiple: true,
            value: value.value,
            columnWidths: [180, 220],
            'onValue-change': (d: { value: string | string[] }) => {
              value.value = Array.isArray(d.value) ? d.value : d.value ? [d.value] : []
            },
          },
          {
            // Slot injection (maps to React renderNode)
            node: (ctx: { node: TreeNodeContract; branch: boolean }) =>
              h('span', { class: 'demo-result' }, [
                ctx.branch ? '📁 ' : '• ',
                ctx.node.label,
              ]),
          },
        ),
        h(
          'span',
          { class: 'demo-result' },
          `Selected: ${value.value.length ? value.value.join(', ') : '—'}`,
        ),
      ])
  },
})

function TreeSelectWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%', maxWidth: 420 }}
      ref={root => {
        mountWc(
          root,
          `<h-tree-select
             label="设备类型 (WC)"
             placeholder="选择设备类型"
             multiple
             column-width="180"
             column-widths='[180,220]'
             height="240"
             nodes='${JSON.stringify(nodes)}'
           >
             <template data-slot="node">
               <span data-bind="label"></span>
             </template>
           </h-tree-select>
           <span class="demo-result">Selected: —</span>`,
          host => {
            const el = host.querySelector('h-tree-select') as HTMLElement & {
              onValueChange?: (d: { value: string | string[]; selectedValue: string[] }) => void
            }
            const out = host.querySelector('.demo-result')
            if (!el || !out) return
            el.onValueChange = d => {
              const ids = d.selectedValue?.length
                ? d.selectedValue
                : Array.isArray(d.value)
                  ? d.value
                  : d.value
                    ? [d.value]
                    : []
              out.textContent = `Selected: ${ids.length ? ids.join(', ') : '—'}`
            }
          },
        )
      }}
    />
  )
}

export default function TreeSelectView() {
  const [value, setValue] = useState<string[]>([])
  const definition: ViewDefinition = {
    apiKey: 'tree-select',
    title: 'Tree Select',
    description:
      'Cascader-style hierarchical select. React: renderNode/renderValue/renderTag. Vue: #node #value #tag. WC: renderNode prop or <template data-slot="node">. columnWidth / columnWidths set column sizes.',
    reactDemo: (
      <div className="demo-stack" style={{ width: '100%', maxWidth: 420 }}>
        <HTreeSelect
          label="设备类型"
          placeholder="选择设备类型"
          nodes={nodes}
          selectBranches
          multiple
          value={value}
          columnWidths={[180, 220]}
          renderNode={({ node, branch }) => (
            <span>
              {branch ? '📁 ' : '• '}
              {node.label}
            </span>
          )}
          onValueChange={details =>
            setValue(
              Array.isArray(details.value)
                ? details.value
                : details.value
                  ? [details.value]
                  : [],
            )
          }
        />
        <span className="demo-result">Selected: {value.length ? value.join(', ') : '—'}</span>
      </div>
    ),
    vueDemo: VueTreeSelectDemo,
    webDemo: <TreeSelectWebDemo />,
  }

  return <ComponentPage {...definition} />
}
