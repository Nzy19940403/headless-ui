import { useMemo, useState } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HTree } from '@demo/ui-react'
import { HTree as VueHTree } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { ViewDefinition } from './types'
import type { TreeNodeContract } from '@demo/ui-core'

function buildDemoNodes(): TreeNodeContract[] {
  const sites: TreeNodeContract[] = []
  for (let s = 1; s <= 8; s++) {
    const areas: TreeNodeContract[] = []
    for (let a = 1; a <= 6; a++) {
      const devices: TreeNodeContract[] = []
      for (let d = 1; d <= 12; d++) {
        devices.push({
          id: `s${s}-a${a}-d${d}`,
          label: `Device ${s}.${a}.${d}`,
          children: [
            { id: `s${s}-a${a}-d${d}-t`, label: 'Temperature' },
            { id: `s${s}-a${a}-d${d}-p`, label: 'Pressure' },
            { id: `s${s}-a${a}-d${d}-v`, label: 'Vibration' },
          ],
        })
      }
      areas.push({ id: `s${s}-a${a}`, label: `Area ${s}-${a}`, children: devices })
    }
    sites.push({ id: `s${s}`, label: `Mine site ${s}`, children: areas })
  }
  return sites
}

const demoNodes = buildDemoNodes()

function ReactTreeDemo() {
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>(['s1', 's1-a1'])
  const nodes = useMemo(() => demoNodes, [])

  return (
    <div className="demo-stack" style={{ width: '100%', minWidth: 0, gap: 12 }}>
      <HTree
        label="Fleet / equipment tree"
        nodes={nodes}
        virtual
        height={360}
        rowHeight={32}
        overscan={10}
        expandedValue={expanded}
        onExpandedChange={d => setExpanded(d.expandedValue)}
        selectedValue={selected}
        onSelectionChange={d => setSelected(d.selectedValue)}
      />
      <span className="demo-result">
        Selected: {selected[0] ?? '—'} · Expanded: {expanded.length} branches
      </span>
    </div>
  )
}

const VueTreeDemo = defineComponent({
  name: 'VueTreeDemo',
  setup() {
    const selected = ref<string[]>([])
    const expanded = ref<string[]>(['s1', 's1-a1'])
    return () =>
      h('div', { class: 'demo-stack', style: 'width:100%;min-width:0;gap:12px' }, [
        h(VueHTree, {
          label: 'Fleet / equipment tree',
          nodes: demoNodes,
          virtual: true,
          height: 360,
          rowHeight: 32,
          overscan: 10,
          expandedValue: expanded.value,
          selectedValue: selected.value,
          // Same payload as React; Vue also emits expanded-change / selection-change
          onExpandedChange: (d: { expandedValue: string[] }) => {
            expanded.value = d.expandedValue
          },
          onSelectionChange: (d: { selectedValue: string[] }) => {
            selected.value = d.selectedValue
          },
        }),
        h(
          'span',
          { class: 'demo-result' },
          `Selected: ${selected.value[0] ?? '—'} · Expanded: ${expanded.value.length} branches`,
        ),
      ])
  },
})

/**
 * WC demo — same pattern as select/table:
 * - React only provides a host div + mountWc
 * - Markup is real custom elements in light DOM
 * - Handlers: onSelectionChange / onExpandedChange property (React-aligned) + kebab CustomEvents
 * - Results update .demo-result in the WC tree, not React state wrapping the CE
 */
function TreeWebDemo() {
  return (
    <div
      className="demo-stack"
      style={{ width: '100%', minWidth: 0 }}
      ref={root => {
        mountWc(
          root,
          `<h-tree
             label="Fleet / equipment tree"
             height="360"
             row-height="32"
             overscan="10"
             virtual
             default-expanded-value='["s1","s1-a1"]'
             style="width:100%"
           ></h-tree>
           <span class="demo-result">Selected: — · Expanded: 2 branches</span>`,
          host => {
            const el = host.querySelector('h-tree') as HTMLElement & {
              nodes?: TreeNodeContract[]
              refresh?: () => void
              onSelectionChange?: (d: { selectedValue: string[] }) => void
              onExpandedChange?: (d: { expandedValue: string[] }) => void
            } | null
            const out = host.querySelector('.demo-result')
            if (!el || !out) return

            // Large payload: property assignment (same as table columns/data when not only attributes)
            el.nodes = demoNodes

            let selectedText = '—'
            let expandedCount = 2
            const paint = () => {
              out.textContent = `Selected: ${selectedText} · Expanded: ${expandedCount} branches`
            }

            // React-aligned property callbacks (emitDetail also fires kebab CustomEvents)
            el.onSelectionChange = d => {
              selectedText = d.selectedValue[0] ?? '—'
              paint()
            }
            el.onExpandedChange = d => {
              expandedCount = d.expandedValue.length
              paint()
            }

            // Optional: listeners for non-property consumers
            el.addEventListener('selection-change', event => {
              const detail = (event as CustomEvent<{ selectedValue: string[] }>).detail
              selectedText = detail?.selectedValue?.[0] ?? '—'
              paint()
            })
            el.addEventListener('expanded-change', event => {
              const detail = (event as CustomEvent<{ expandedValue: string[] }>).detail
              expandedCount = detail?.expandedValue?.length ?? 0
              paint()
            })

            el.refresh?.()
            requestAnimationFrame(() => el.refresh?.())
          },
        )
      }}
    />
  )
}

export default function TreeViewPage() {
  const definition: ViewDefinition = {
    apiKey: 'tree',
    title: 'Tree',
    description:
      'Ark/Zag TreeView with TanStack Virtual. React/WC: onSelectionChange / onExpandedChange; Vue: same + selection-change / expanded-change.',
    reactDemo: <ReactTreeDemo />,
    vueDemo: VueTreeDemo,
    webDemo: <TreeWebDemo />,
  }
  return <ComponentPage {...definition} />
}
