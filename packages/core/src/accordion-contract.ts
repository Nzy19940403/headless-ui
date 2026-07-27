import type { ComponentContent } from './shared'

/** Payload for multi-value expand / collapse. */
export interface AccordionValueChangeDetails {
  value: string[]
}

export type AccordionValueChangeHandler = (details: AccordionValueChangeDetails) => void

export interface AccordionItemContract<TContent = ComponentContent> {
  value: string
  title: TContent
  content: TContent
}

export interface AccordionContract<TContent = ComponentContent> {
  items: AccordionItemContract<TContent>[]
  multiple?: boolean
  defaultValue?: string[]
  value?: string[]
  onValueChange?: AccordionValueChangeHandler
}
