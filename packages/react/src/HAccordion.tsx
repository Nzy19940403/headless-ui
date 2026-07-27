import { Accordion as ArkAccordion } from '@ark-ui/react/accordion'
import type { AccordionContract, AccordionItemContract, AccordionValueChangeDetails } from '@demo/ui-core'

export interface HAccordionItem extends AccordionItemContract<React.ReactNode> {}

export interface HAccordionProps extends AccordionContract<React.ReactNode> {
  onValueChange?: (details: AccordionValueChangeDetails) => void
}

export function HAccordion({ items, multiple = false, defaultValue, value, onValueChange }: HAccordionProps) {
  return (
    <ArkAccordion.Root multiple={multiple} defaultValue={defaultValue} value={value} onValueChange={onValueChange} className="accordion">
      {items.map(item => (
        <ArkAccordion.Item key={item.value} value={item.value} className="accordion-item">
          <ArkAccordion.ItemTrigger className="accordion-trigger">
            {item.title}
            <ArkAccordion.ItemIndicator>+</ArkAccordion.ItemIndicator>
          </ArkAccordion.ItemTrigger>
          <ArkAccordion.ItemContent className="accordion-content">{item.content}</ArkAccordion.ItemContent>
        </ArkAccordion.Item>
      ))}
    </ArkAccordion.Root>
  )
}
