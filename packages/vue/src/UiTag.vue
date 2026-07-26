<script setup lang="ts">
import type { TagTone } from '@demo/ui-core'

withDefaults(defineProps<{ tone?: TagTone }>(), { tone: 'neutral' })
</script>

<template>
  <span class="ui-tag" :class="`ui-tag--${tone}`">
    <slot />
  </span>
</template>
