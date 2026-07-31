<script setup lang="ts">
import { Checkbox } from '@ark-ui/vue/checkbox'
import { Field } from '@ark-ui/vue/field'
import type { CheckedChangeDetails, CheckboxContract } from '@demo/ui-core'

const props = defineProps<CheckboxContract>()
const emit = defineEmits<{ 'checked-change': [details: CheckedChangeDetails] }>()
</script>

<template>
  <Field.Root
    class="ui-checkbox-field"
    :invalid="Boolean(props.error)"
    :disabled="props.disabled"
  >
    <Checkbox.Root
      :checked="props.checked"
      :default-checked="props.defaultChecked"
      :disabled="props.disabled"
      @checked-change="emit('checked-change', { checked: Boolean($event.checked) })"
    >
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Field.Label class="ui-field__label--inline">{{ props.label }}</Field.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Field.HelperText v-if="props.helperText && !props.error" class="ui-field__helper">
      {{ props.helperText }}
    </Field.HelperText>
    <Field.ErrorText v-if="props.error" class="ui-field__error">{{ props.error }}</Field.ErrorText>
  </Field.Root>
</template>
