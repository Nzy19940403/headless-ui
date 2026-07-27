<script setup lang="ts">
import { computed } from 'vue'
import { Avatar } from '@ark-ui/vue/avatar'
import type { AvatarContract } from '@demo/ui-core'

const props = withDefaults(defineProps<AvatarContract>(), { size: 'md' })
const initials = computed(() => props.fallback ?? (props.alt ? props.alt.slice(0, 2).toUpperCase() : '?'))
</script>

<template>
  <Avatar.Root class="ui-avatar" :class="`ui-avatar--${size}`">
    <Avatar.Fallback class="ui-avatar__fallback">{{ initials }}</Avatar.Fallback>
    <Avatar.Image v-if="src" class="ui-avatar__image" :src="src" :alt="alt ?? ''" />
  </Avatar.Root>
</template>
