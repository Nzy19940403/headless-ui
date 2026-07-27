<script setup lang="ts">
import type { TagContract } from '@demo/ui-core'

withDefaults(defineProps<TagContract>(), { tone: 'neutral' })
</script>

<template>
  <span class="ui-tag" :class="`ui-tag--${tone}`">
    <slot />
  </span>
</template>
