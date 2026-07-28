<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import {
  TreeViewRootProvider,
  TreeViewLabel,
  TreeViewTree,
  TreeViewNodeProvider,
  TreeViewBranchControl,
  TreeViewBranchIndicator,
  TreeViewBranchText,
  TreeViewItem,
  TreeViewItemText,
  createTreeCollection,
  useTreeView,
} from '@ark-ui/vue/tree-view'
import type {
  TreeCollectionNode,
  TreeExpandedChangeDetails,
  TreeNodeContract,
  TreeSelectionChangeDetails,
  TreeSelectionMode,
} from '@demo/ui-core'
import {
  TREE_ROOT_ID,
  resolveTreeHeight,
  toTreeRootNode,
  treeRowPaddingLeft,
} from '@demo/ui-core'

const props = withDefaults(
  defineProps<{
    nodes: TreeNodeContract[]
    label?: string
    selectionMode?: TreeSelectionMode
    expandedValue?: string[]
    defaultExpandedValue?: string[]
    selectedValue?: string[]
    defaultSelectedValue?: string[]
    virtual?: boolean
    height?: number | string
    rowHeight?: number
    overscan?: number
    expandOnClick?: boolean
    class?: string
    onExpandedChange?: (details: TreeExpandedChangeDetails) => void
    onSelectionChange?: (details: TreeSelectionChangeDetails) => void
  }>(),
  {
    selectionMode: 'single',
    virtual: true,
    height: 360,
    rowHeight: 32,
    overscan: 8,
    expandOnClick: true,
    defaultExpandedValue: () => [],
    defaultSelectedValue: () => [],
  },
)

const emit = defineEmits<{
  'expanded-change': [details: TreeExpandedChangeDetails]
  'selection-change': [details: TreeSelectionChangeDetails]
  expandedChange: [details: TreeExpandedChangeDetails]
  selectionChange: [details: TreeSelectionChangeDetails]
}>()

const scrollEl = ref<HTMLDivElement | null>(null)
const expandedLocal = ref<string[]>([...(props.expandedValue ?? props.defaultExpandedValue ?? [])])
const selectedLocal = ref<string[]>([...(props.selectedValue ?? props.defaultSelectedValue ?? [])])
const virtualizerApi = ref<{ scrollToIndex: (i: number, opts?: { align?: string }) => void } | null>(null)

watch(
  () => props.expandedValue,
  v => {
    if (v !== undefined) expandedLocal.value = [...v]
  },
)

watch(
  () => props.selectedValue,
  v => {
    if (v !== undefined) selectedLocal.value = [...v]
  },
)

const collection = computed(() =>
  createTreeCollection<TreeCollectionNode>({
    rootNode: toTreeRootNode(props.nodes ?? []),
    nodeToValue: n => n.id,
    nodeToString: n => n.label,
    isNodeDisabled: n => Boolean(n.disabled),
  }),
)

const tree = useTreeView(
  computed(() => ({
    id: 'h-tree-vue',
    collection: collection.value,
    selectionMode: props.selectionMode,
    expandOnClick: props.expandOnClick,
    expandedValue: expandedLocal.value,
    selectedValue: selectedLocal.value,
    onExpandedChange(details: { expandedValue: string[] }) {
      expandedLocal.value = details.expandedValue
      const payload = { expandedValue: details.expandedValue }
      props.onExpandedChange?.(payload)
      emit('expanded-change', payload)
      emit('expandedChange', payload)
    },
    onSelectionChange(details: { selectedValue: string[] }) {
      selectedLocal.value = details.selectedValue
      const payload = { selectedValue: details.selectedValue }
      props.onSelectionChange?.(payload)
      emit('selection-change', payload)
      emit('selectionChange', payload)
    },
    scrollToIndexFn: props.virtual
      ? (details: { index: number }) => {
          virtualizerApi.value?.scrollToIndex(details.index, { align: 'auto' })
        }
      : undefined,
  })),
)

const visibleNodes = computed(() => tree.value.getVisibleNodes())

const virtualizer = useVirtualizer(
  computed(() => ({
    count: visibleNodes.value.length,
    getScrollElement: () => scrollEl.value,
    estimateSize: () => props.rowHeight ?? 32,
    overscan: props.overscan ?? 8,
    enabled: props.virtual !== false,
  })),
)

watch(
  virtualizer,
  v => {
    virtualizerApi.value = v
  },
  { immediate: true },
)

const viewportHeight = computed(() => resolveTreeHeight(props.height))

const totalSize = computed(() => {
  if (props.virtual === false) {
    return visibleNodes.value.length * (props.rowHeight ?? 32)
  }
  return virtualizer.value.getTotalSize()
})

const virtualItems = computed(() => {
  if (props.virtual === false) {
    return visibleNodes.value.map((_, index) => ({
      index,
      start: index * (props.rowHeight ?? 32),
      size: props.rowHeight ?? 32,
      key: index,
    }))
  }
  return virtualizer.value.getVirtualItems()
})

function rowPad(indexPath: number[] | undefined) {
  return treeRowPaddingLeft(indexPath)
}

function indentStyle(indexPath: number[] | undefined, depth: number) {
  const pad = rowPad(indexPath)
  return {
    paddingLeft: `${pad}px`,
    '--ui-tree-indent': `${pad}px`,
    '--depth': depth,
  }
}

// Ensure first layout measures scroll element
nextTick(() => {
  virtualizer.value.measure?.()
})
</script>

<template>
  <TreeViewRootProvider :value="tree" :class="['ui-tree', props.class].filter(Boolean).join(' ')">
    <TreeViewLabel v-if="label" class="ui-tree__label">{{ label }}</TreeViewLabel>
    <TreeViewTree class="ui-tree__tree">
      <div
        ref="scrollEl"
        class="ui-tree__viewport"
        :style="{ height: viewportHeight, overflow: 'auto' }"
      >
        <div
          class="ui-tree__virtual-spacer"
          :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }"
        >
          <div
            v-for="vRow in virtualItems"
            :key="String(visibleNodes[vRow.index]?.node?.id ?? vRow.index)"
            class="ui-tree__row"
            :data-index="vRow.index"
            :style="{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: `${vRow.size}px`,
              transform: `translateY(${vRow.start}px)`,
            }"
          >
            <template v-if="visibleNodes[vRow.index] && visibleNodes[vRow.index].node.id !== TREE_ROOT_ID">
              <TreeViewNodeProvider
                :node="visibleNodes[vRow.index].node"
                :index-path="visibleNodes[vRow.index].indexPath"
              >
                <template v-if="tree.getNodeState(visibleNodes[vRow.index]).isBranch">
                  <TreeViewBranchControl
                    class="ui-tree__node ui-tree__node--branch"
                    :style="indentStyle(visibleNodes[vRow.index].indexPath, tree.getNodeState(visibleNodes[vRow.index]).depth)"
                  >
                    <TreeViewBranchIndicator class="ui-tree__indicator">
                      <span class="ui-tree__chevron" aria-hidden="true">
                        {{ tree.getNodeState(visibleNodes[vRow.index]).expanded ? '▾' : '▸' }}
                      </span>
                    </TreeViewBranchIndicator>
                    <TreeViewBranchText class="ui-tree__text">
                      {{ collection.stringifyNode(visibleNodes[vRow.index].node) }}
                    </TreeViewBranchText>
                  </TreeViewBranchControl>
                </template>
                <template v-else>
                  <TreeViewItem
                    class="ui-tree__node ui-tree__node--leaf"
                    :style="indentStyle(visibleNodes[vRow.index].indexPath, tree.getNodeState(visibleNodes[vRow.index]).depth)"
                  >
                    <span class="ui-tree__indicator ui-tree__indicator--leaf" aria-hidden="true" />
                    <TreeViewItemText class="ui-tree__text">
                      {{ collection.stringifyNode(visibleNodes[vRow.index].node) }}
                    </TreeViewItemText>
                  </TreeViewItem>
                </template>
              </TreeViewNodeProvider>
            </template>
          </div>
        </div>
      </div>
    </TreeViewTree>
  </TreeViewRootProvider>
</template>
