/** Single-thumb slider change payload (H* maps Ark number[] → number). */
export interface NumberValueChangeDetails {
  value: number
}

export type NumberValueChangeHandler = (details: NumberValueChangeDetails) => void

export interface SliderContract {
  label?: string
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  name?: string
  onValueChange?: NumberValueChangeHandler
}
