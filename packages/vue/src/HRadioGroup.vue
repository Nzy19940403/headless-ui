<script setup lang="ts">
import { RadioGroup } from '@ark-ui/vue/radio-group'
import type { RadioGroupContract, ValueChangeDetails } from '@demo/ui-core'

/**
 * Ark Vue radio uses modelValue for controlled state (not `value`).
 * We still expose Core contract prop name `value` and map it here.
 */
defineProps<RadioGroupContract>()
const emit = defineEmits<{
  'value-change': [details: ValueChangeDetails]
  'update:value': [value: string]
}>()

function onValueChange(details: { value: string | null }) {
  const v = details.value ?? ''
  emit('value-change', { value: v })
  emit('update:value', v)
}
</script>

<template>
  <RadioGroup.Root
    class="ui-radio-group"
    :model-value="value"
    :default-value="defaultValue"
    :disabled="disabled"
    :name="name"
    @value-change="onValueChange"
  >
    <RadioGroup.Label v-if="label" class="ui-field__label">{{ label }}</RadioGroup.Label>
    <div class="ui-radio-group__items">
      <RadioGroup.Item
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        class="ui-radio"
      >
        <RadioGroup.ItemControl class="ui-radio__control" />
        <RadioGroup.ItemText class="ui-radio__label">{{ item.label }}</RadioGroup.ItemText>
        <RadioGroup.ItemHiddenInput />
      </RadioGroup.Item>
    </div>
  </RadioGroup.Root>
</template>
