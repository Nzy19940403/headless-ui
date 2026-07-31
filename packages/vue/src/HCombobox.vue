<script setup lang="ts" generic="V extends string | number = string | number">
import { computed } from 'vue'
import { createListCollection, Combobox } from '@ark-ui/vue/combobox'
import { buildSelectValueMap } from '@demo/ui-core'
import type { ComboboxContract, ValueChangeDetails } from '@demo/ui-core'

/**
 * Ark Vue Combobox.Root uses createListCollection which normalises values to
 * string.  Same String()→backmap pattern as HSelect.
 */
const props = withDefaults(defineProps<ComboboxContract<V>>(), {
  placeholder: 'Search…',
})
const emit = defineEmits<{ 'value-change': [details: ValueChangeDetails<V>]; 'update:value': [value: V] }>()

/** string → original typed value (O(1) reverse lookup when Ark emits back) */
const valueBackmap = computed(() => buildSelectValueMap(props.items))

const collection = computed(() =>
  createListCollection({
    items: props.items.map(item => ({ ...item, value: String(item.value) })),
    itemToString: item => item.label,
    itemToValue: item => item.value,
  }),
)

const modelValue = computed(() => (props.value !== undefined ? [String(props.value)] : undefined))
const defaultModelValue = computed(() =>
  props.defaultValue !== undefined ? [String(props.defaultValue)] : undefined,
)

function onValueChange(details: { value: string[] }) {
  const first = details.value[0]
  const next = first !== undefined ? (valueBackmap.value.get(first) ?? '' as V) : '' as V
  emit('value-change', { value: next })
  emit('update:value', next)
}
</script>

<template>
  <Combobox.Root
    class="ui-combobox"
    :collection="collection"
    :disabled="disabled"
    :name="name"
    :model-value="modelValue"
    :default-value="defaultModelValue"
    @value-change="onValueChange"
  >
    <Combobox.Label v-if="label" class="ui-field__label">{{ label }}</Combobox.Label>
    <Combobox.Control class="ui-combobox__control">
      <Combobox.Input class="ui-combobox__input" :placeholder="placeholder" />
      <Combobox.Trigger class="ui-combobox__trigger" type="button">▾</Combobox.Trigger>
    </Combobox.Control>
    <Teleport to="body">
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
    </Teleport>
  </Combobox.Root>
</template>
