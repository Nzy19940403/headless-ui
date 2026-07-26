import { Accordion as ArkAccordion } from '@ark-ui/react/accordion'

export interface AccordionItem {
  value: string
  title: React.ReactNode
  content: React.ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  multiple?: boolean
}

export function Accordion({ items, multiple = false }: AccordionProps) {
  return (
    <ArkAccordion.Root multiple={multiple} className="accordion">
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
