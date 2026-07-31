import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface SelectItemContract<V = string | number> {
  value: V
  label: string
  disabled?: boolean
}

export interface SelectContract<V = string | number> {
  items: SelectItemContract<V>[]
  value?: V
  defaultValue?: V
  placeholder?: string
  disabled?: boolean
  name?: string
  label?: string
  error?: string
  helperText?: string
  onValueChange?: ValueChangeHandler<V>
}

export type { ValueChangeDetails }
