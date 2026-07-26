<script setup lang="ts">
import { ref } from 'vue'
import { Dialog } from '@ark-ui/vue/dialog'

defineProps<{
  trigger: string
  title: string
  description?: string
}>()

const open = ref(false)
</script>

<template>
  <Dialog.Root :open="open" @open-change="open = $event.open">
    <Dialog.Trigger class="ui-button ui-button--secondary">
      {{ trigger }}
    </Dialog.Trigger>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content class="dialog-content">
        <Dialog.Title>{{ title }}</Dialog.Title>
        <Dialog.Description v-if="description">
          {{ description }}
        </Dialog.Description>
        <slot />
        <Dialog.CloseTrigger class="ui-button ui-button--secondary">
          Close
        </Dialog.CloseTrigger>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
</template>
