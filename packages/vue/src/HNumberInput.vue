<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { NumberInput } from '@ark-ui/vue/number-input'
import type { NumberInputContract, ValueChangeDetails } from '@demo/ui-core'

/**
 * Ark Vue NumberInput.Root uses modelValue (not `value`) for controlled state.
 * See docs/ai/vue-value-model-binding-rules.md
 */
const props = defineProps<NumberInputContract & { class?: string }>()
const emit = defineEmits<{
  'update:value': [value: string | number]
  'value-change': [details: ValueChangeDetails<string | number>]
}>()

function pinCaretToEnd(input: HTMLInputElement | null) {
  if (!input || document.activeElement !== input) return
  const len = input.value.length
  try {
    input.setSelectionRange(len, len)
  } catch {
    /* ignore */
  }
}

function onInputFocus(event: FocusEvent) {
  const input = event.currentTarget as HTMLInputElement
  requestAnimationFrame(() => pinCaretToEnd(input))
}

function onValueChange(details: { value: string }) {
  emit('value-change', { value: details.value })
  emit('update:value', details.value)
  nextTick(() => {
    const input = document.activeElement
    if (input instanceof HTMLInputElement && input.classList.contains('ui-number-input__input')) {
      pinCaretToEnd(input)
    }
  })
}

watch(
  () => props.value,
  () => {
    nextTick(() => {
      const input = document.activeElement
      if (input instanceof HTMLInputElement && input.classList.contains('ui-number-input__input')) {
        pinCaretToEnd(input)
      }
    })
  },
)
</script>

<template>
  <NumberInput.Root
    class="ui-number-input"
    :class="props.class"
    :model-value="props.value === undefined ? undefined : String(props.value)"
    :default-value="props.defaultValue === undefined ? undefined : String(props.defaultValue)"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    :read-only="props.readOnly"
    :required="props.required"
    :name="props.name"
    :invalid="Boolean(props.error)"
    :format-options="props.formatOptions"
    :allow-mouse-wheel="props.allowMouseWheel"
    @value-change="onValueChange"
  >
    <NumberInput.Label v-if="props.label" class="ui-field__label">{{ props.label }}</NumberInput.Label>
    <NumberInput.Control class="ui-number-input__control">
      <NumberInput.Scrubber v-if="props.scrubber" class="ui-number-input__scrubber" aria-hidden="true">
        ⇄
      </NumberInput.Scrubber>
      <NumberInput.Input class="ui-number-input__input" @focus="onInputFocus" />
      <div class="ui-number-input__triggers">
        <NumberInput.IncrementTrigger class="ui-number-input__trigger" type="button">+</NumberInput.IncrementTrigger>
        <NumberInput.DecrementTrigger class="ui-number-input__trigger" type="button">−</NumberInput.DecrementTrigger>
      </div>
    </NumberInput.Control>
    <span v-if="props.helperText && !props.error" class="ui-field__helper">{{ props.helperText }}</span>
    <span v-if="props.error" class="ui-field__error">{{ props.error }}</span>
  </NumberInput.Root>
</template>
