<script setup lang="ts">
import { Accordion } from '@ark-ui/vue/accordion'
import type { AccordionContract, AccordionItemContract, AccordionValueChangeDetails } from '@demo/ui-core'

export interface HAccordionItem extends AccordionItemContract<string> {}

withDefaults(defineProps<AccordionContract<string>>(), { multiple: false })
const emit = defineEmits<{ 'value-change': [details: AccordionValueChangeDetails] }>()
</script>

<template>
  <Accordion.Root
    :multiple="multiple"
    :default-value="defaultValue"
    :value="value"
    class="accordion"
    @value-change="emit('value-change', $event)"
  >
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
