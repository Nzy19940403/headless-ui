<script setup lang="ts">
import type { SeparatorContract } from '@demo/ui-core'

withDefaults(defineProps<SeparatorContract>(), {
  orientation: 'horizontal',
})
</script>

<template>
  <div
    role="separator"
    class="ui-separator"
    :class="`ui-separator--${orientation}`"
    :aria-orientation="orientation"
  />
</template>
