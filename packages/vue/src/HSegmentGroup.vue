<script setup lang="ts">
import { SegmentGroup } from '@ark-ui/vue/segment-group'
import type { SegmentGroupContract, ValueChangeDetails } from '@demo/ui-core'

defineProps<SegmentGroupContract>()
const emit = defineEmits<{ 'update:value': [value: string]; 'value-change': [details: ValueChangeDetails] }>()

function onValueChange(details: { value: string | null }) {
  const v = details.value ?? ''
  emit('value-change', { value: v })
  emit('update:value', v)
}
</script>

<template>
  <SegmentGroup.Root
    class="ui-segment-group"
    :value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :name="name"
    @value-change="onValueChange"
  >
    <SegmentGroup.Label v-if="label" class="ui-field__label">{{ label }}</SegmentGroup.Label>
    <div class="ui-segment-group__items">
      <SegmentGroup.Item
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
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
