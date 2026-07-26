<script setup lang="ts">
import { Checkbox } from '@ark-ui/vue/checkbox'

defineProps<{
  label: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:checked': [value: boolean] }>()
</script>

<template>
  <Checkbox.Root
    :checked="checked"
    :default-checked="defaultChecked"
    :disabled="disabled"
    @checked-change="emit('update:checked', Boolean($event.checked))"
  >
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>{{ label }}</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
