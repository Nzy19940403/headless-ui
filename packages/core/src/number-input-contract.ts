import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

/** Cross-stack NumberInput value accepted by the public adapters. */
export type NumberInputValue = string | number

export interface NumberInputContract {
  label?: string
  value?: NumberInputValue
  defaultValue?: NumberInputValue
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  error?: string
  helperText?: string
  /** Intl.NumberFormat options — fraction digits, currency, percent, etc. */
  formatOptions?: Intl.NumberFormatOptions
  /** Increment / decrement with mouse wheel while focused */
  allowMouseWheel?: boolean
  /** Show drag scrubber (ew-resize) before the input */
  scrubber?: boolean
  onValueChange?: ValueChangeHandler<string | number>
}

export type { ValueChangeDetails }
