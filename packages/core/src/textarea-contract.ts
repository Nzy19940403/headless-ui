import type { InputSize, ValueChangeDetails } from './input-contract'
import type { ValueChangeHandler } from './tabs-contract'

export interface TextareaContract {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  error?: string
  helperText?: string
  rows?: number
  name?: string
  size?: InputSize
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
