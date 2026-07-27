<script setup lang="ts">
import { Switch } from '@ark-ui/vue/switch'
import type { CheckedChangeDetails, ToggleContract } from '@demo/ui-core'

defineProps<ToggleContract>()
const emit = defineEmits<{ 'checked-change': [details: CheckedChangeDetails] }>()
</script>

<!-- Vue renderer: Ark UI owns the interaction state machine. -->
<template>
  <Switch.Root
    :checked="checked"
    :default-checked="defaultChecked"
    :disabled="disabled"
    @checked-change="emit('checked-change', $event)"
  >
    <Switch.Control><Switch.Thumb /></Switch.Control>
    <Switch.Label><slot /></Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>
