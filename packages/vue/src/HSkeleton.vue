<script setup lang="ts">
import type { SkeletonContract } from '@demo/ui-core'

withDefaults(defineProps<SkeletonContract>(), {
  width: '100%',
  height: '1rem',
  animated: true,
})
</script>

<template>
  <div
    class="ui-skeleton"
    :class="{ 'ui-skeleton--circle': circle, 'ui-skeleton--animated': animated }"
    :style="{ width: circle ? height : width, height }"
    aria-hidden="true"
  />
</template>
