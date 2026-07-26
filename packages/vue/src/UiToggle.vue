<script setup lang="ts">
import { Switch } from '@ark-ui/vue/switch'

defineProps<{ checked?: boolean; defaultChecked?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ 'update:checked': [value: boolean] }>()
</script>

<!-- Vue Renderer: Ark UI owns the interaction state machine. -->
<template>
  <Switch.Root :checked="checked" :default-checked="defaultChecked" :disabled="disabled" @checked-change="emit('update:checked', $event.checked)">
    <Switch.Control><Switch.Thumb /></Switch.Control>
    <Switch.Label><slot /></Switch.Label>
    <Switch.HiddenInput />
  </Switch.Root>
</template>
