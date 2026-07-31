<script setup lang="ts">
import { computed } from 'vue'
import { SegmentGroup } from '@ark-ui/vue/segment-group'
import type { SegmentGroupContract, ValueChangeDetails } from '@demo/ui-core'

/**
 * Ark Vue SegmentGroup.Root uses modelValue (not `value`) for controlled state.
 * See docs/ai/vue-value-model-binding-rules.md
 */
const props = withDefaults(defineProps<SegmentGroupContract & { class?: string }>(), {
  fullWidth: false,
  size: 'md',
})
const emit = defineEmits<{
  'update:value': [value: string]
  'value-change': [details: ValueChangeDetails]
}>()

const rootClass = computed(() =>
  [
    'ui-segment-group',
    `ui-segment-group--${props.size}`,
    props.fullWidth ? 'ui-segment-group--full-width' : null,
    props.class,
  ]
    .filter(Boolean)
    .join(' '),
)

const rootStyle = computed(() =>
  props.fullWidth ? { width: '100%', alignSelf: 'stretch' } : undefined,
)

const itemsClass = computed(() =>
  ['ui-segment-group__items', props.fullWidth ? 'ui-segment-group__items--full-width' : null]
    .filter(Boolean)
    .join(' '),
)

const itemsStyle = computed(() =>
  props.fullWidth ? { width: '100%', display: 'flex' } : undefined,
)

function onValueChange(details: { value: string | null }) {
  const v = details.value ?? ''
  emit('value-change', { value: v })
  emit('update:value', v)
}
</script>

<template>
  <SegmentGroup.Root
    :class="rootClass"
    :data-full-width="fullWidth ? '' : undefined"
    :data-size="size"
    :data-disabled="disabled ? '' : undefined"
    :style="rootStyle"
    :model-value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :name="name"
    @value-change="onValueChange"
  >
    <SegmentGroup.Label v-if="label" class="ui-field__label">{{ label }}</SegmentGroup.Label>
    <div :class="itemsClass" :style="itemsStyle" :data-size="size">
      <SegmentGroup.Item
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled || disabled"
        class="ui-segment"
      >
        <SegmentGroup.ItemText class="ui-segment__text">{{ item.label }}</SegmentGroup.ItemText>
        <SegmentGroup.ItemControl class="ui-segment__control" />
        <SegmentGroup.ItemHiddenInput />
      </SegmentGroup.Item>
      <SegmentGroup.Indicator class="ui-segment-group__indicator" />
    </div>
  </SegmentGroup.Root>
</template>
