import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputContract {
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  error?: string
  helperText?: string
  size?: InputSize
  name?: string
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
