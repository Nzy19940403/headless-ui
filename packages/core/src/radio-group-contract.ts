import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface RadioItemContract {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupContract {
  items: RadioItemContract[]
  value?: string
  defaultValue?: string
  disabled?: boolean
  name?: string
  label?: string
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
