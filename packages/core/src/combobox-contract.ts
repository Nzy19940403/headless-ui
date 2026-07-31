import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface ComboboxItemContract<V = string | number> {
  value: V
  label: string
  disabled?: boolean
}

export interface ComboboxContract<V = string | number> {
  items: ComboboxItemContract<V>[]
  value?: V
  defaultValue?: V
  placeholder?: string
  disabled?: boolean
  name?: string
  label?: string
  onValueChange?: ValueChangeHandler<V>
}

export type { ValueChangeDetails }
