import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface PasswordInputContract {
  label?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  error?: string
  helperText?: string
  /** Auto-complete hint for password managers. */
  autoComplete?: 'current-password' | 'new-password'
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
