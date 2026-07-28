/**
 * Headless debug: boot Zag tree-view the same way h-tree should, print visible count.
 * Run: node scripts/debug-tree.mjs
 */
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const treeView = require('@zag-js/tree-view')
const { VanillaMachine, normalizeProps } = require('@zag-js/vanilla')

const TREE_ROOT_ID = '__h_tree_root__'
const nodes = [
  {
    id: 's1',
    label: 'Site 1',
    children: [
      {
        id: 's1-a1',
        label: 'Area 1',
        children: [
          { id: 's1-a1-d1', label: 'Device 1', children: [{ id: 't', label: 'Temp' }] },
        ],
      },
    ],
  },
  { id: 's2', label: 'Site 2', children: [{ id: 's2-a1', label: 'Area 2-1' }] },
]

const collection = treeView.collection({
  rootNode: { id: TREE_ROOT_ID, label: '', children: nodes },
  nodeToValue: n => n.id,
  nodeToString: n => n.label,
})

const machine = new VanillaMachine(treeView.machine, {
  id: 'debug-tree',
  collection,
  selectionMode: 'single',
  expandOnClick: true,
  defaultExpandedValue: [TREE_ROOT_ID, 's1', 's1-a1'],
})

machine.start()

const apiWrong = treeView.connect(machine, normalizeProps)
const apiRight = treeView.connect(machine.service, normalizeProps)

function dump(label, api) {
  try {
    const vis = api.getVisibleNodes()
    console.log(label, {
      count: vis?.length,
      ids: vis?.map(v => v.node.id),
      paths: vis?.map(v => v.indexPath?.join('/')),
    })
  } catch (e) {
    console.log(label, 'THREW', e.message)
  }
}

dump('connect(machine) WRONG', apiWrong)
dump('connect(machine.service) RIGHT', apiRight)

// expand nothing case
const m2 = new VanillaMachine(treeView.machine, {
  id: 'debug-tree-2',
  collection,
  defaultExpandedValue: [],
})
m2.start()
const api2 = treeView.connect(m2.service, normalizeProps)
dump('expanded=[]', api2)
