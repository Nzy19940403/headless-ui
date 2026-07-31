<script setup lang="ts">
import { computed } from 'vue'
import type { StackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<StackContract & { class?: string }>(), {
  gap: 'md',
  align: 'stretch',
  justify: 'start',
  wrap: false,
  stackBelow: 'never',
  reverse: false,
})

const classes = computed(() => stackClassName('ui-stack', props, props.class, props.wrap))
const styles = computed(() => stackStyle(props))
</script>

<template>
  <div :class="classes" :style="styles">
    <slot />
  </div>
</template>
