<script setup lang="ts">
import { computed } from 'vue'
import type { VStackContract } from '@demo/ui-core'
import { stackClassName, stackStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<VStackContract & { class?: string }>(), {
  gap: 'md',
  align: 'stretch',
  justify: 'start',
  reverse: false,
  fillHeight: false,
})

const classes = computed(() => stackClassName('ui-v-stack', props, props.class))
const styles = computed(() => stackStyle(props))
</script>

<template>
  <div :class="classes" :style="styles">
    <slot />
  </div>
</template>
