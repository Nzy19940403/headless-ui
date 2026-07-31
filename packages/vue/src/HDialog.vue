<script setup lang="ts">
import { computed } from 'vue'
import { Dialog } from '@ark-ui/vue/dialog'
import type { DialogContract, OpenChangeDetails } from '@demo/ui-core'

const props = withDefaults(defineProps<DialogContract<string>>(), {
  defaultOpen: false,
  lazyMount: true,
  unmountOnExit: true,
  skipAnimationOnMount: false,
})
const emit = defineEmits<{ 'open-change': [details: OpenChangeDetails] }>()

/** Same controlled-open fix as HDrawer: only pass `open` when parent controls it. */
const rootProps = computed(() => {
  const result: Record<string, unknown> = {
    defaultOpen: props.defaultOpen,
    lazyMount: props.lazyMount,
    unmountOnExit: props.unmountOnExit,
    skipAnimationOnMount: props.skipAnimationOnMount,
  }
  if (props.open !== undefined) result.open = props.open
  return result
})
</script>

<template>
  <Dialog.Root v-bind="rootProps" @open-change="emit('open-change', $event)">
    <Dialog.Trigger v-if="props.trigger" class="ui-button ui-button--secondary">
      {{ trigger }}
    </Dialog.Trigger>
    <Dialog.Backdrop class="ui-dialog__backdrop" />
    <Dialog.Positioner class="ui-dialog__positioner">
      <Dialog.Content class="dialog-content ui-dialog__content">
        <Dialog.Title class="ui-dialog__title">{{ title }}</Dialog.Title>
        <Dialog.Description v-if="description" class="ui-dialog__description">
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
