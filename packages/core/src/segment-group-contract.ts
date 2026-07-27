import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface SegmentItemContract {
  value: string
  label: string
  disabled?: boolean
}

export interface SegmentGroupContract {
  items: SegmentItemContract[]
  value?: string
  defaultValue?: string
  disabled?: boolean
  name?: string
  label?: string
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
