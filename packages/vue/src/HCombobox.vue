<script setup lang="ts">
import { computed } from 'vue'
import { createListCollection, Combobox } from '@ark-ui/vue/combobox'
import type { ComboboxContract, ValueChangeDetails } from '@demo/ui-core'

const props = withDefaults(defineProps<ComboboxContract>(), {
  placeholder: 'Search…',
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
  <Combobox.Root
    class="ui-combobox"
    :collection="collection"
    :disabled="disabled"
    :name="name"
    :value="value ? [value] : undefined"
    :default-value="defaultValue ? [defaultValue] : undefined"
    @value-change="(details) => { emit('value-change', { value: details.value[0] ?? '' }); emit('update:value', details.value[0] ?? '') }"
  >
    <Combobox.Label v-if="label" class="ui-field__label">{{ label }}</Combobox.Label>
    <Combobox.Control class="ui-combobox__control">
      <Combobox.Input class="ui-combobox__input" :placeholder="placeholder" />
      <Combobox.Trigger class="ui-combobox__trigger" type="button">▾</Combobox.Trigger>
    </Combobox.Control>
    <Combobox.Positioner>
      <Combobox.Content class="ui-combobox__content">
        <Combobox.Item
          v-for="item in collection.items"
          :key="item.value"
          :item="item"
          class="ui-combobox__item"
        >
          <Combobox.ItemText>{{ item.label }}</Combobox.ItemText>
          <Combobox.ItemIndicator class="ui-combobox__item-indicator">✓</Combobox.ItemIndicator>
        </Combobox.Item>
      </Combobox.Content>
    </Combobox.Positioner>
  </Combobox.Root>
</template>
