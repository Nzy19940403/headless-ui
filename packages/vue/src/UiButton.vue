<script setup lang="ts">
import type { ButtonSize, ButtonVariant } from '@demo/ui-core'
withDefaults(defineProps<{ variant?: ButtonVariant; size?: ButtonSize; disabled?: boolean }>(), { variant: 'primary', size: 'md' })
</script>
<template><button class="ui-button" :class="[`ui-button--${variant}`, `ui-button--${size}`]" :disabled="disabled"><slot /></button></template>
