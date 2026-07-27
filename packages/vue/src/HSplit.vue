<script setup lang="ts">
import { computed } from 'vue'
import type { SplitContract } from '@demo/ui-core'
import { splitClassName, splitStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<SplitContract & { class?: string }>(), {
  ratio: '1:1',
  gap: 'md',
  collapseBelow: 'md',
  sidebarWidth: '320px',
  align: 'stretch',
})

const classes = computed(() => splitClassName(props, props.class))
const styles = computed(() => splitStyle(props))
</script>

<template>
  <div :class="classes" :style="styles">
    <slot />
  </div>
</template>
