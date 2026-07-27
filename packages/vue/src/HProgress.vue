<script setup lang="ts">
import { Progress } from '@ark-ui/vue/progress'
import type { ProgressContract } from '@demo/ui-core'

withDefaults(defineProps<ProgressContract>(), {
  min: 0,
  max: 100,
})
</script>

<template>
  <Progress.Root class="ui-progress" :value="indeterminate ? null : value" :min="min" :max="max">
    <div v-if="label" class="ui-progress__header">
      <Progress.Label class="ui-progress__label">{{ label }}</Progress.Label>
      <Progress.ValueText v-if="!indeterminate" class="ui-progress__value" />
    </div>
    <Progress.Track class="ui-progress__track">
      <Progress.Range class="ui-progress__range" />
    </Progress.Track>
  </Progress.Root>
</template>
