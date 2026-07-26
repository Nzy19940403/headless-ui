<script setup lang="ts">
import type { CardVariant } from '@demo/ui-core'

withDefaults(defineProps<{
  title?: string
  description?: string
  variant?: CardVariant
}>(), { variant: 'surface' })
</script>

<template>
  <section class="ui-card" :class="`ui-card--${variant}`">
    <header v-if="title || description" class="ui-card__header">
      <h3 v-if="title" class="ui-card__title">{{ title }}</h3>
      <p v-if="description" class="ui-card__description">{{ description }}</p>
    </header>
    <slot />
  </section>
</template>
