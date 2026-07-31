<script setup lang="ts">
import { computed } from 'vue'
import { Field } from '@ark-ui/vue/field'
import type { InputContract, ValueChangeDetails } from '@demo/ui-core'

const props = withDefaults(defineProps<InputContract & { class?: string }>(), {
  size: 'md',
  type: 'text',
})
const emit = defineEmits<{
  'update:value': [value: string]
  'value-change': [details: ValueChangeDetails]
}>()

/**
 * Ark Vue Field.Input is modelValue-based (not native `value` / `default-value`).
 * Only bind modelValue when controlled; otherwise pass default once via initial value.
 */
const isControlled = computed(() => props.value !== undefined)

function onModelUpdate(value: string | number | undefined) {
  const next = value == null ? '' : String(value)
  emit('update:value', next)
  emit('value-change', { value: next })
}
</script>

<template>
  <Field.Root
    class="ui-field"
    :class="[`ui-field--${props.size}`, props.class]"
    :invalid="Boolean(props.error)"
    :required="props.required"
    :disabled="props.disabled"
    :read-only="props.readOnly"
  >
    <Field.Label v-if="props.label" class="ui-field__label">
      {{ props.label }}
      <span v-if="props.required" class="ui-field__required">*</span>
    </Field.Label>
    <!-- Controlled: modelValue = value. Uncontrolled: modelValue starts as defaultValue. -->
    <Field.Input
      v-if="isControlled"
      class="ui-input"
      :type="props.type"
      :name="props.name"
      :placeholder="props.placeholder"
      :model-value="props.value"
      :disabled="props.disabled"
      :readonly="props.readOnly"
      :required="props.required"
      @update:model-value="onModelUpdate"
    />
    <Field.Input
      v-else
      class="ui-input"
      :type="props.type"
      :name="props.name"
      :placeholder="props.placeholder"
      :model-value="props.defaultValue ?? ''"
      :disabled="props.disabled"
      :readonly="props.readOnly"
      :required="props.required"
      @update:model-value="onModelUpdate"
    />
    <Field.HelperText v-if="props.helperText && !props.error" class="ui-field__helper">
      {{ props.helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="props.error" class="ui-field__error">{{ props.error }}</Field.ErrorText>
  </Field.Root>
</template>
