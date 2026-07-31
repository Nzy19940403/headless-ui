<script setup lang="ts">
import { computed, ref, toRef, useAttrs, type CSSProperties } from 'vue'
import { useSortable } from '@dnd-kit/vue/sortable'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  index: number
  disabled?: boolean
  style?: CSSProperties
}>()

const attrs = useAttrs()
const element = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null)
const { isDragging, isDropTarget } = useSortable({
  id: toRef(props, 'id'),
  index: toRef(props, 'index'),
  disabled: computed(() => props.disabled ?? false),
  group: 'ui-table-columns',
  element,
  handle,
  transition: { idle: true },
})
</script>

<template>
  <th
    ref="element"
    v-bind="attrs"
    :class="[
      attrs.class,
      isDragging ? 'ui-table__th--dragging' : '',
      isDropTarget ? 'ui-table__th--drag-over' : '',
    ]"
    :style="props.style"
  >
    <span ref="handle" class="ui-table__drag-activator">
      <slot />
    </span>
    <slot name="resize" />
  </th>
</template>
