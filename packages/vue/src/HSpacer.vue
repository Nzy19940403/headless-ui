<script setup lang="ts">
import { computed } from 'vue'
import type { SpacerContract } from '@demo/ui-core'
import { spacerClassName, spacerStyle } from '@demo/ui-core'

const props = withDefaults(defineProps<SpacerContract & { class?: string }>(), {
  size: 'md',
  grow: true,
})

const classes = computed(() => spacerClassName(props, props.class))
const styles = computed(() => spacerStyle(props))
</script>

<template>
  <div :class="classes" :style="styles" aria-hidden="true" />
</template>
