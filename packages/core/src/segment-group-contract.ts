import type { ValueChangeHandler, ValueChangeDetails } from './tabs-contract'

export interface SegmentItemContract {
  value: string
  label: string
  /** Disable a single segment */
  disabled?: boolean
}

export type SegmentGroupSize = 'sm' | 'md' | 'lg'

export interface SegmentGroupContract {
  items: SegmentItemContract[]
  value?: string
  defaultValue?: string
  /** Disable the entire group */
  disabled?: boolean
  name?: string
  label?: string
  /**
   * When true, the outer control and its bordered track wrapper stretch to
   * 100% of the parent while the segment buttons keep their natural widths.
   * Default false — hug content (inline).
   */
  fullWidth?: boolean
  size?: SegmentGroupSize
  onValueChange?: ValueChangeHandler
}

export type { ValueChangeDetails }
