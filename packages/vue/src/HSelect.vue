<script setup lang="ts">
import { computed } from 'vue'
import { createListCollection, Select } from '@ark-ui/vue/select'
import type { SelectContract, ValueChangeDetails } from '@demo/ui-core'

const props = withDefaults(defineProps<SelectContract>(), {
  placeholder: 'Select…',
})
const emit = defineEmits<{ 'value-change': [details: ValueChangeDetails]; 'update:value': [value: string] }>()

const collection = computed(() =>
  createListCollection({
    items: props.items,
    itemToString: item => item.label,
    itemToValue: item => item.value,
  }),
)
</script>

<template>
  <Select.Root
    class="ui-select"
    :collection="collection"
    :disabled="disabled"
    :name="name"
    :value="value ? [value] : undefined"
    :default-value="defaultValue ? [defaultValue] : undefined"
    @value-change="(details) => { emit('value-change', { value: details.value[0] ?? '' }); emit('update:value', details.value[0] ?? '') }"
  >
    <Select.Label v-if="label" class="ui-field__label">{{ label }}</Select.Label>
    <Select.Control class="ui-select__control">
      <Select.Trigger class="ui-select__trigger">
        <Select.ValueText :placeholder="placeholder" />
        <Select.Indicator class="ui-select__indicator">▾</Select.Indicator>
      </Select.Trigger>
    </Select.Control>
    <Select.Positioner>
      <Select.Content class="ui-select__content">
        <Select.Item
          v-for="item in collection.items"
          :key="item.value"
          :item="item"
          class="ui-select__item"
        >
          <Select.ItemText>{{ item.label }}</Select.ItemText>
          <Select.ItemIndicator class="ui-select__item-indicator">✓</Select.ItemIndicator>
        </Select.Item>
      </Select.Content>
    </Select.Positioner>
    <Select.HiddenSelect />
  </Select.Root>
</template>
