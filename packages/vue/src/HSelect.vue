<script setup lang="ts" generic="V extends string | number = string | number">
import { computed } from 'vue'
import { createListCollection, Select } from '@ark-ui/vue/select'
import { Field } from '@ark-ui/vue/field'
import { buildSelectValueMap } from '@demo/ui-core'
import type { SelectContract, ValueChangeDetails } from '@demo/ui-core'

/**
 * Ark Vue Select.Root uses createListCollection which normalises values to
 * string.  We String()-encode going in and reverse-lookup via
 * buildSelectValueMap coming out — callers work with string | number, Ark
 * only ever sees string.
 */
const props = withDefaults(defineProps<SelectContract<V>>(), {
  placeholder: 'Select…',
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
  <Field.Root
    class="ui-select"
    :invalid="Boolean(props.error)"
    :disabled="props.disabled"
  >
    <Select.Root
      :collection="collection"
      :disabled="disabled"
      :name="name"
      :model-value="modelValue"
      :default-value="defaultModelValue"
      @value-change="onValueChange"
    >
      <Field.Label v-if="label" class="ui-field__label">{{ label }}</Field.Label>
      <Select.Control class="ui-select__control">
        <Select.Trigger class="ui-select__trigger">
          <Select.ValueText :placeholder="placeholder" />
          <Select.Indicator class="ui-select__indicator">▾</Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Teleport to="body">
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
      </Teleport>
      <Select.HiddenSelect />
    </Select.Root>
    <Field.HelperText v-if="props.helperText && !props.error" class="ui-field__helper">
      {{ props.helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="props.error" class="ui-field__error">{{ props.error }}</Field.ErrorText>
  </Field.Root>
</template>
