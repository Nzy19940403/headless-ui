<script setup lang="ts">
import { Accordion } from '@ark-ui/vue/accordion'

export interface UiAccordionItem {
  value: string
  title: string
  content: string
}

defineProps<{
  items: UiAccordionItem[]
  multiple?: boolean
}>()
</script>

<template>
  <Accordion.Root :multiple="multiple" class="accordion">
    <Accordion.Item v-for="item in items" :key="item.value" :value="item.value" class="accordion-item">
      <Accordion.ItemTrigger class="accordion-trigger">
        {{ item.title }}
        <Accordion.ItemIndicator>+</Accordion.ItemIndicator>
      </Accordion.ItemTrigger>
      <Accordion.ItemContent class="accordion-content">
        {{ item.content }}
      </Accordion.ItemContent>
    </Accordion.Item>
  </Accordion.Root>
</template>
