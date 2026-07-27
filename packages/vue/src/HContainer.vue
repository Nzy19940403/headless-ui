<script setup lang="ts">
import { computed } from 'vue'
import type { ContainerContract } from '@demo/ui-core'
import { containerClassName, containerStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<ContainerContract & { class?: string }>(), {
  size: 'xl',
  padded: true,
  center: true,
})

const classes = computed(() => containerClassName(props, props.class))
const styles = computed(() => containerStyle(props))
</script>

<template>
  <div :class="classes" :style="styles">
    <slot />
  </div>
</template>
