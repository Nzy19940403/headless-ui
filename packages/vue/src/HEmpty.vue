<script setup lang="ts">
import type { EmptyContract } from '@demo/ui-core'

withDefaults(defineProps<EmptyContract<string>>(), {
  title: 'No data',
})
</script>

<template>
  <div class="ui-empty">
    <div class="ui-empty__icon" aria-hidden="true">○</div>
    <h3 v-if="title" class="ui-empty__title">{{ title }}</h3>
    <p v-if="description" class="ui-empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="ui-empty__action">
      <slot />
    </div>
  </div>
</template>
