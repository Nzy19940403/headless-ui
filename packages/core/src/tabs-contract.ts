import type { ComponentContent } from './shared'

/** Payload for single-value selection (Tabs, and similar). */
export interface ValueChangeDetails<T = string> {
  value: T
}

export type ValueChangeHandler<T = string> = (details: ValueChangeDetails<T>) => void

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
