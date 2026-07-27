<script setup lang="ts">
import { Field } from '@ark-ui/vue/field'
import type { TextareaContract, ValueChangeDetails } from '@demo/ui-core'

withDefaults(defineProps<TextareaContract & { class?: string }>(), {
  size: 'md',
  rows: 3,
})
const emit = defineEmits<{ 'update:value': [value: string]; 'value-change': [details: ValueChangeDetails] }>()

function onInput(event: Event) {
  const value = (event.target as HTMLTextAreaElement).value
  emit('update:value', value)
  emit('value-change', { value })
}
</script>

<template>
  <Field.Root
    class="ui-field"
    :class="[`ui-field--${size}`, $props.class]"
    :invalid="Boolean(error)"
    :required="required"
    :disabled="disabled"
  >
    <Field.Label v-if="label" class="ui-field__label">
      {{ label }}
      <span v-if="required" class="ui-field__required">*</span>
    </Field.Label>
    <Field.Textarea
      class="ui-textarea"
      :name="name"
      :placeholder="placeholder"
      :value="value"
      :default-value="defaultValue"
      :disabled="disabled"
      :readonly="readOnly"
      :required="required"
      :rows="rows"
      @input="onInput"
    />
    <Field.HelperText v-if="helperText && !error" class="ui-field__helper">{{ helperText }}</Field.HelperText>
    <Field.ErrorText v-if="error" class="ui-field__error">{{ error }}</Field.ErrorText>
  </Field.Root>
</template>
