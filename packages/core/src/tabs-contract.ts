import type { ComponentContent } from './shared'

/** Payload for single-value selection (Tabs, and similar). */
export interface ValueChangeDetails {
  value: string
}

export type ValueChangeHandler = (details: ValueChangeDetails) => void

export interface TabsItemContract<TContent = ComponentContent> {
  value: string
  label: string
  content: TContent
}

export interface TabsContract<TContent = ComponentContent> {
  defaultValue?: string
  value?: string
  items: TabsItemContract<TContent>[]
  onValueChange?: ValueChangeHandler
}
