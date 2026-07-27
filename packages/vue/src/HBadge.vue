<script setup lang="ts">
import type { BadgeContract } from '@demo/ui-core'

withDefaults(defineProps<BadgeContract>(), { tone: 'neutral' })
</script>

<template>
  <span class="ui-badge" :class="[`ui-badge--${tone}`, dot ? 'ui-badge--dot' : '']">
    <slot v-if="!dot" />
  </span>
</template>
