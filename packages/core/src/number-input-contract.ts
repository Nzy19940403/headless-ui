import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface NumberInputContract {
  label?: string
  value?: string
  defaultValue?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  error?: string
  helperText?: string
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
