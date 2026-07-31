<script setup lang="ts">
import type { TagContract } from '@demo/ui-core'

withDefaults(defineProps<TagContract>(), { tone: 'neutral', size: 'md' })
</script>

<template>
  <span class="ui-tag" :class="[`ui-tag--${tone}`, `ui-tag--${size}`]">
    <slot>{{ content }}</slot>
  </span>
</template>
