/** Payload for checked / unchecked transitions (Toggle, Checkbox). */
export interface CheckedChangeDetails {
  checked: boolean
}

export type CheckedChangeHandler = (details: CheckedChangeDetails) => void

export interface ToggleContract {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
  onCheckedChange?: CheckedChangeHandler
}
