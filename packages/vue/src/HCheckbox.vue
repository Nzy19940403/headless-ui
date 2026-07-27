<script setup lang="ts">
import { Checkbox } from '@ark-ui/vue/checkbox'
import type { CheckedChangeDetails, CheckboxContract } from '@demo/ui-core'

defineProps<CheckboxContract>()
const emit = defineEmits<{ 'checked-change': [details: CheckedChangeDetails] }>()
</script>

<template>
  <Checkbox.Root
    :checked="checked"
    :default-checked="defaultChecked"
    :disabled="disabled"
    @checked-change="emit('checked-change', { checked: Boolean($event.checked) })"
  >
    <Checkbox.Control>
      <Checkbox.Indicator>✓</Checkbox.Indicator>
    </Checkbox.Control>
    <Checkbox.Label>{{ label }}</Checkbox.Label>
    <Checkbox.HiddenInput />
  </Checkbox.Root>
</template>
