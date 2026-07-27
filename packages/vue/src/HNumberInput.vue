<script setup lang="ts">
import { NumberInput } from '@ark-ui/vue/number-input'
import type { NumberInputContract, ValueChangeDetails } from '@demo/ui-core'

defineProps<NumberInputContract>()
const emit = defineEmits<{ 'update:value': [value: string]; 'value-change': [details: ValueChangeDetails] }>()

function onValueChange(details: { value: string }) {
  emit('value-change', { value: details.value })
  emit('update:value', details.value)
}
</script>

<template>
  <NumberInput.Root
    class="ui-number-input"
    :value="value"
    :default-value="defaultValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :invalid="Boolean(error)"
    @value-change="onValueChange"
  >
    <NumberInput.Label v-if="label" class="ui-field__label">{{ label }}</NumberInput.Label>
    <NumberInput.Control class="ui-number-input__control">
      <NumberInput.Input class="ui-number-input__input" />
      <div class="ui-number-input__triggers">
        <NumberInput.IncrementTrigger class="ui-number-input__trigger" type="button">+</NumberInput.IncrementTrigger>
        <NumberInput.DecrementTrigger class="ui-number-input__trigger" type="button">−</NumberInput.DecrementTrigger>
      </div>
    </NumberInput.Control>
    <span v-if="helperText && !error" class="ui-field__helper">{{ helperText }}</span>
    <span v-if="error" class="ui-field__error">{{ error }}</span>
  </NumberInput.Root>
</template>
