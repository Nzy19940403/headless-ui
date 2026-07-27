export interface ProgressContract {
  value?: number
  min?: number
  max?: number
  label?: string
  /** When true, shows indeterminate styling. */
  indeterminate?: boolean
}
