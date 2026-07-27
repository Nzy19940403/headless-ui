<script setup lang="ts">
import type { ButtonContract } from '@demo/ui-core'

withDefaults(defineProps<ButtonContract>(), { variant: 'primary', size: 'md' })
</script>

<template><button class="ui-button" :class="[`ui-button--${variant}`, `ui-button--${size}`]" :disabled="disabled"><slot /></button></template>
