<script setup lang="ts">
import { Tabs } from '@ark-ui/vue/tabs'
import type { TabsContract, TabsItemContract, ValueChangeDetails } from '@demo/ui-core'

export interface HTabItem extends TabsItemContract<string> {}

defineProps<TabsContract<string>>()
const emit = defineEmits<{ 'value-change': [details: ValueChangeDetails] }>()
</script>

<template>
  <Tabs.Root
    :default-value="defaultValue"
    :value="value"
    @value-change="emit('value-change', $event)"
  >
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
