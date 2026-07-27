<script setup lang="ts">
import { PasswordInput } from '@ark-ui/vue/password-input'
import type { PasswordInputContract, ValueChangeDetails } from '@demo/ui-core'

withDefaults(defineProps<PasswordInputContract>(), {
  autoComplete: 'current-password',
})
const emit = defineEmits<{ 'update:value': [value: string]; 'value-change': [details: ValueChangeDetails] }>()

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:value', value)
  emit('value-change', { value })
}
</script>

<template>
  <PasswordInput.Root
    class="ui-password-input"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :invalid="Boolean(error)"
    :name="name"
    :auto-complete="autoComplete"
  >
    <PasswordInput.Label v-if="label" class="ui-field__label">{{ label }}</PasswordInput.Label>
    <PasswordInput.Control class="ui-password-input__control">
      <PasswordInput.Input
        class="ui-password-input__input"
        :value="value"
        :default-value="defaultValue"
        :placeholder="placeholder"
        @input="onInput"
      />
      <PasswordInput.VisibilityTrigger class="ui-password-input__trigger" type="button">
        <PasswordInput.Indicator class="ui-password-input__indicator" fallback="Show">
          Hide
        </PasswordInput.Indicator>
      </PasswordInput.VisibilityTrigger>
    </PasswordInput.Control>
    <span v-if="helperText && !error" class="ui-field__helper">{{ helperText }}</span>
    <span v-if="error" class="ui-field__error">{{ error }}</span>
  </PasswordInput.Root>
</template>
