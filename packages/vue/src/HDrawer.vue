<script setup lang="ts">
import { computed } from 'vue'
import { Drawer } from '@ark-ui/vue/drawer'
import type { DrawerContract, OpenChangeDetails } from '@demo/ui-core'
import { drawerSwipeDirection } from '@demo/ui-core'

const props = withDefaults(defineProps<DrawerContract<string> & { class?: string }>(), {
  defaultOpen: false,
  placement: 'right',
  size: '360px',
  floatingTrigger: false,
  lazyMount: true,
  unmountOnExit: true,
  skipAnimationOnMount: false,
})

const emit = defineEmits<{ 'open-change': [details: OpenChangeDetails] }>()

const swipeDirection = computed(() => drawerSwipeDirection(props.placement))
const rootProps = computed(() => {
  const result: Record<string, unknown> = {
    defaultOpen: props.defaultOpen,
    swipeDirection: swipeDirection.value,
    lazyMount: props.lazyMount,
    unmountOnExit: props.unmountOnExit,
    skipAnimationOnMount: props.skipAnimationOnMount,
  }
  if (props.open !== undefined) result.open = props.open
  return result
})
const panelStyle = computed(() => ({ '--ui-drawer-size': props.size }))
const positionerClass = computed(
  () => `ui-drawer__positioner ui-drawer__positioner--${props.placement}`,
)
const contentClass = computed(
  () => `ui-drawer__content ui-drawer__content--${props.placement}`,
)
</script>

<template>
  <!-- Presence: lazy-mount + unmount-on-exit so CSS [data-state] enter/exit animations run -->
  <Drawer.Root
    v-bind="rootProps"
    @open-change="emit('open-change', $event)"
  >
    <Drawer.Trigger
      v-if="props.trigger"
      :class="['ui-button', props.floatingTrigger ? 'ui-drawer__floating-trigger' : 'ui-button--secondary']"
    >
      {{ trigger }}
    </Drawer.Trigger>
    <Drawer.Backdrop class="ui-drawer__backdrop" />
    <Drawer.Positioner :class="positionerClass" :data-placement="props.placement">
      <Drawer.Content
        :class="contentClass"
        :style="panelStyle"
        :data-placement="props.placement"
      >
        <header class="ui-drawer__header">
          <Drawer.Title class="ui-drawer__title">{{ title }}</Drawer.Title>
          <Drawer.CloseTrigger class="ui-button ui-button--ghost ui-drawer__close" type="button">
            Close
          </Drawer.CloseTrigger>
        </header>
        <Drawer.Description v-if="description" class="ui-drawer__description">
          {{ description }}
        </Drawer.Description>
        <div class="ui-drawer__body">
          <slot />
        </div>
      </Drawer.Content>
    </Drawer.Positioner>
  </Drawer.Root>
</template>
