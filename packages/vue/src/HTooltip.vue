<script setup lang="ts">
import { Tooltip } from '@ark-ui/vue/tooltip'
import type { OpenChangeDetails, TooltipContract } from '@demo/ui-core'

withDefaults(defineProps<TooltipContract<string>>(), {
  positioning: 'top',
})

const emit = defineEmits<{ 'open-change': [details: OpenChangeDetails] }>()
</script>

<template>
  <Tooltip.Root
    :open="open"
    :default-open="defaultOpen"
    :disabled="disabled"
    :positioning="{ placement: positioning }"
    @open-change="details => emit('open-change', { open: details.open })"
  >
    <Tooltip.Trigger class="ui-tooltip-trigger">
      <slot />
    </Tooltip.Trigger>
    <Tooltip.Positioner>
      <Tooltip.Content class="ui-tooltip">{{ content }}</Tooltip.Content>
    </Tooltip.Positioner>
  </Tooltip.Root>
</template>
