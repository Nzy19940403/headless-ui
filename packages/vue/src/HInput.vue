<script setup lang="ts">
import { Field } from '@ark-ui/vue/field'
import type { InputContract, ValueChangeDetails } from '@demo/ui-core'

withDefaults(defineProps<InputContract & { class?: string }>(), {
  size: 'md',
  type: 'text',
})
const emit = defineEmits<{ 'update:value': [value: string]; 'value-change': [details: ValueChangeDetails] }>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:value', value)
  emit('value-change', { value })
}
</script>

<template>
  <Field.Root class="ui-field" :class="[`ui-field--${size}`, $props.class]" :invalid="Boolean(error)" :required="required" :disabled="disabled">
    <Field.Label v-if="label" class="ui-field__label">
      {{ label }}
      <span v-if="required" class="ui-field__required">*</span>
    </Field.Label>
    <Field.Input
      class="ui-input"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :value="value"
      :default-value="defaultValue"
      :disabled="disabled"
      :readonly="readOnly"
      :required="required"
      @input="onInput"
    />
    <Field.HelperText v-if="helperText && !error" class="ui-field__helper">{{ helperText }}</Field.HelperText>
    <Field.ErrorText v-if="error" class="ui-field__error">{{ error }}</Field.ErrorText>
  </Field.Root>
</template>
