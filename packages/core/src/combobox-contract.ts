import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface ComboboxItemContract {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxContract {
  items: ComboboxItemContract[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  name?: string
  label?: string
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
