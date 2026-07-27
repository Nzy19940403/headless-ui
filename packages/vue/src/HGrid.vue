<script setup lang="ts">
import { computed } from 'vue'
import type { GridContract } from '@demo/ui-core'
import { gridClassName, gridStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<GridContract & { class?: string }>(), {
  columns: 'auto-fit',
  minChildWidth: '240px',
  gap: 'md',
  equalHeight: false,
})

const classes = computed(() => gridClassName(props, props.class))
const styles = computed(() => gridStyle(props))
</script>

<template>
  <div :class="classes" :style="styles">
    <slot />
  </div>
</template>
