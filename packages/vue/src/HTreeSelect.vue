<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Popover } from '@ark-ui/vue/popover'
import type {
  TreeNodeContract,
  TreeSelectContract,
  TreeSelectNodeRenderContext,
  TreeSelectTagRenderContext,
  TreeSelectValue,
  TreeSelectValueChangeDetails,
  TreeSelectValueRenderContext,
  TreeExpandedChangeDetails,
} from '@demo/ui-core'
import {
  flattenTreeSelectNodes,
  normalizeTreeSelectValue,
  resolveTreeSelectColumns,
  resolveTreeSelectColumnWidth,
  resolveTreeSelectPath,
} from '@demo/ui-core'

const props = withDefaults(
  defineProps<
    TreeSelectContract & {
      class?: string
    }
  >(),
  {
    placeholder: 'Select',
    selectBranches: false,
    multiple: false,
    height: 240,
    columnWidth: 180,
    defaultExpandedValue: () => [],
    lazyMount: true,
    unmountOnExit: true,
    skipAnimationOnMount: false,
  },
)

const emit = defineEmits<{
  'value-change': [details: TreeSelectValueChangeDetails]
  'update:value': [value: TreeSelectValue]
  'expanded-change': [details: TreeExpandedChangeDetails]
}>()

const nodeIndex = computed(
  () => new Map(flattenTreeSelectNodes(props.nodes).map(node => [node.id, node])),
)

const controlled = computed(() => props.value !== undefined)
const internalValues = ref(normalizeTreeSelectValue(props.defaultValue, props.multiple))
const internalPath = ref(resolveTreeSelectPath(props.nodes, props.defaultExpandedValue ?? []))
const open = ref(false)

watch(
  () => props.value,
  value => {
    if (value !== undefined) internalValues.value = normalizeTreeSelectValue(value, props.multiple)
  },
)

watch(
  () => props.expandedValue,
  value => {
    if (value !== undefined) internalPath.value = resolveTreeSelectPath(props.nodes, value)
  },
)

const selectedValues = computed(() =>
  controlled.value
    ? normalizeTreeSelectValue(props.value, props.multiple)
    : internalValues.value,
)

const selectedNodes = computed(() =>
  selectedValues.value
    .map(id => nodeIndex.value.get(id))
    .filter((node): node is TreeNodeContract => Boolean(node)),
)

const activePath = computed(() =>
  resolveTreeSelectPath(props.nodes, props.expandedValue ?? internalPath.value),
)

const columns = computed(() => resolveTreeSelectColumns(props.nodes, activePath.value))

const menuHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : String(props.height),
)

const selectedLabel = computed(() => {
  if (!selectedNodes.value.length) return props.placeholder
  return selectedNodes.value.map(node => node.label).join(props.multiple ? '、' : '')
})

function updatePath(nextPath: string[]) {
  if (props.expandedValue === undefined) internalPath.value = nextPath
  emit('expanded-change', { expandedValue: nextPath })
}

function emitValue(nextValues: string[]) {
  if (!controlled.value) internalValues.value = nextValues
  const payload: TreeSelectValueChangeDetails = {
    value: props.multiple ? nextValues : nextValues[0] ?? '',
    selectedValue: nextValues,
  }
  emit('value-change', payload)
  emit('update:value', payload.value)
  if (!props.multiple) open.value = false
}

function toggleValue(id: string) {
  const nextValues = selectedValues.value.includes(id)
    ? selectedValues.value.filter(valueId => valueId !== id)
    : [...selectedValues.value, id]
  emitValue(nextValues)
}

function handleNodeClick(node: TreeNodeContract, columnIndex: number) {
  const nextPath = activePath.value.slice(0, columnIndex)
  if (node.children?.length) {
    if (props.selectBranches) toggleValue(node.id)
    updatePath([...nextPath, node.id])
    return
  }
  if (props.multiple) toggleValue(node.id)
  else emitValue([node.id])
}

function columnStyle(columnIndex: number) {
  const width = resolveTreeSelectColumnWidth(columnIndex, props.columnWidth, props.columnWidths)
  return {
    maxHeight: menuHeight.value,
    width,
    minWidth: width,
  }
}

function nodeContext(
  node: TreeNodeContract,
  columnIndex: number,
): TreeSelectNodeRenderContext {
  return {
    node,
    level: columnIndex,
    selected: selectedValues.value.includes(node.id),
    active: activePath.value[columnIndex] === node.id,
    disabled: Boolean(node.disabled),
    branch: Boolean(node.children?.length),
    multiple: props.multiple,
  }
}

function valueContext(): TreeSelectValueRenderContext {
  return {
    value: props.multiple ? selectedValues.value : selectedValues.value[0] ?? '',
    selectedValue: selectedValues.value,
    selectedNodes: selectedNodes.value,
    multiple: props.multiple,
  }
}

function tagContext(node: TreeNodeContract): TreeSelectTagRenderContext & { onRemove: () => void } {
  return {
    node,
    selectedValue: selectedValues.value,
    multiple: props.multiple,
    onRemove: () => toggleValue(node.id),
  }
}
</script>

<template>
  <div class="ui-tree-select" :class="props.class" :data-multiple="multiple ? '' : undefined">
    <Popover.Root
      :open="open"
      lazy-mount
      unmount-on-exit
      :skip-animation-on-mount="skipAnimationOnMount"
      :positioning="{ placement: 'bottom-start', sameWidth: false, flip: false, shift: 0 }"
      @open-change="(d: { open: boolean }) => { open = d.open }"
    >
      <label v-if="label" class="ui-field__label">{{ label }}</label>
      <Popover.Trigger
        class="ui-tree-select__trigger"
        type="button"
        :disabled="disabled"
        :aria-label="label ?? placeholder"
        :data-placeholder-shown="selectedNodes.length ? undefined : ''"
      >
        <span class="ui-tree-select__value">
          <!-- #value — replace entire selected display -->
          <slot name="value" v-bind="valueContext()">
            <template v-if="multiple">
              <span class="ui-tree-select__tags">
                <span v-if="selectedNodes.length === 0" class="ui-tree-select__tag-placeholder">
                  {{ placeholder }}
                </span>
                <span
                  v-for="node in selectedNodes"
                  :key="node.id"
                  class="ui-tree-select__tag"
                  :data-node-id="node.id"
                >
                  <span class="ui-tree-select__tag-label">
                    <!-- #tag — per-selected chip; expose onRemove -->
                    <slot name="tag" v-bind="tagContext(node)">
                      {{ node.label }}
                    </slot>
                  </span>
                  <span
                    v-if="!$slots.tag"
                    class="ui-tree-select__tag-remove"
                    role="button"
                    tabindex="0"
                    :aria-label="`Remove ${node.label}`"
                    @pointerdown.stop
                    @click.stop.prevent="toggleValue(node.id)"
                    @keydown.enter.stop.prevent="toggleValue(node.id)"
                    @keydown.space.stop.prevent="toggleValue(node.id)"
                  >
                    ×
                  </span>
                </span>
              </span>
            </template>
            <template v-else>{{ selectedLabel }}</template>
          </slot>
        </span>
        <span class="ui-tree-select__indicator" aria-hidden="true" />
      </Popover.Trigger>

      <Teleport to="body">
      <Popover.Positioner class="ui-tree-select__positioner">
        <Popover.Content class="ui-tree-select__content">
          <div
            class="ui-tree-select__panel"
            role="listbox"
            :aria-label="label ?? placeholder"
            :aria-multiselectable="multiple || undefined"
          >
            <div
              v-for="(column, columnIndex) in columns"
              :key="columnIndex"
              class="ui-tree-select__menu"
              role="group"
              :style="columnStyle(columnIndex)"
            >
              <button
                v-for="node in column"
                :key="node.id"
                class="ui-tree-select__node"
                type="button"
                role="option"
                :aria-label="node.label"
                :aria-selected="selectedValues.includes(node.id)"
                :aria-expanded="
                  node.children?.length ? activePath[columnIndex] === node.id : undefined
                "
                :disabled="node.disabled"
                :data-active="activePath[columnIndex] === node.id ? '' : undefined"
                :data-selected="selectedValues.includes(node.id) ? '' : undefined"
                @click="handleNodeClick(node, columnIndex)"
              >
                <span class="ui-tree-select__radio" aria-hidden="true" />
                <span class="ui-tree-select__node-label">
                  <!-- #node — cascader row label / custom content -->
                  <slot name="node" v-bind="nodeContext(node, columnIndex)">
                    {{ node.label }}
                  </slot>
                </span>
                <span
                  v-if="node.children?.length"
                  class="ui-tree-select__node-indicator"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Positioner>
      </Teleport>
    </Popover.Root>

    <template v-if="name && multiple">
      <input
        v-for="selectedId in selectedValues"
        :key="selectedId"
        type="hidden"
        :name="name"
        :value="selectedId"
        readonly
      >
    </template>
    <input
      v-else-if="name"
      type="hidden"
      :name="name"
      :value="selectedValues[0] ?? ''"
      readonly
    >
  </div>
</template>
