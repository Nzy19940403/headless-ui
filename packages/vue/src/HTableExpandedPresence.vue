<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Presence } from '@ark-ui/vue/presence'

const props = defineProps<{
  present: boolean
  lazyMount: boolean
  unmountOnExit: boolean
}>()

const panelRef = ref<HTMLElement | null>(null)
const contentHeight = ref(0)
let resizeObserver: ResizeObserver | null = null

function observe() {
  const inner = panelRef.value?.querySelector<HTMLElement>('.ui-table__expanded-presence-inner')
  if (!inner) return

  if (resizeObserver) resizeObserver.disconnect()

  resizeObserver = new ResizeObserver(() => {
    if (inner.scrollHeight > 0) {
      contentHeight.value = inner.scrollHeight
    }
  })
  resizeObserver.observe(inner)

  // Initial measurement
  if (inner.scrollHeight > 0) {
    contentHeight.value = inner.scrollHeight
  }
}

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

// Re-observe when `present` toggles to true (DOM becomes visible and measurable).
watch(
  () => props.present,
  async (val) => {
    if (val) {
      await nextTick()
      observe()
    }
  },
)
</script>

<template>
  <Presence :present="present" :lazy-mount="lazyMount" :unmount-on-exit="unmountOnExit" as-child>
    <div
      ref="panelRef"
      class="ui-table__expanded-presence"
      :style="{ '--ui-table-expanded-height': `${contentHeight}px` }"
    >
      <div class="ui-table__expanded-presence-inner">
        <slot />
      </div>
    </div>
  </Presence>
</template>
