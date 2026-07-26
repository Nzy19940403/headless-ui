<script setup lang="ts">
import { Tabs } from '@ark-ui/vue/tabs'

export interface UiTabItem {
  value: string
  label: string
  content: string
}

defineProps<{
  defaultValue: string
  items: UiTabItem[]
}>()
</script>

<template>
  <Tabs.Root :default-value="defaultValue">
    <Tabs.List>
      <Tabs.Trigger v-for="item in items" :key="item.value" :value="item.value">
        {{ item.label }}
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content v-for="item in items" :key="item.value" :value="item.value">
      {{ item.content }}
    </Tabs.Content>
  </Tabs.Root>
</template>
