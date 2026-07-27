export type DatePickerView = 'day' | 'month' | 'year'

export type DatePickerSelectionMode = 'single' | 'multiple' | 'range'

export type DatePickerWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DatePickerPositioning = 'top' | 'bottom' | 'left' | 'right'

/**
 * DatePicker public date values use ISO strings instead of Zag/Ark DateValue.
 *
 * Examples:
 * - single: `['2026-07-27']`
 * - range: `['2026-07-01', '2026-07-31']`
 * - multiple: `['2026-07-01', '2026-07-08']`
 */
export type DatePickerValue = string[]

export interface DatePickerValueChangeDetails {
  value: DatePickerValue
  valueAsString: string[]
  view: DatePickerView
}

export interface DatePickerOpenChangeDetails {
  open: boolean
  value: DatePickerValue
}

export interface DatePickerFocusChangeDetails extends DatePickerValueChangeDetails {
  focusedValue: string
}

export interface DatePickerViewChangeDetails {
  view: DatePickerView
}

export interface DatePickerVisibleRangeChangeDetails {
  view: DatePickerView
  visibleRange: {
    start: string
    end: string
  }
}

export type DatePickerValueChangeHandler = (details: DatePickerValueChangeDetails) => void
export type DatePickerOpenChangeHandler = (details: DatePickerOpenChangeDetails) => void
export type DatePickerFocusChangeHandler = (details: DatePickerFocusChangeDetails) => void
export type DatePickerViewChangeHandler = (details: DatePickerViewChangeDetails) => void
export type DatePickerVisibleRangeChangeHandler = (details: DatePickerVisibleRangeChangeDetails) => void

export interface DatePickerContract {
  id?: string
  label?: string
  name?: string
  placeholder?: string

  value?: DatePickerValue
  defaultValue?: DatePickerValue

  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  invalid?: boolean

  min?: string
  max?: string

  locale?: string
  timeZone?: string

  selectionMode?: DatePickerSelectionMode
  maxSelectedDates?: number

  view?: DatePickerView
  defaultView?: DatePickerView
  minView?: DatePickerView
  maxView?: DatePickerView

  numOfMonths?: number
  startOfWeek?: DatePickerWeekStart
  fixedWeeks?: boolean
  showWeekNumbers?: boolean
  outsideDaySelectable?: boolean
  closeOnSelect?: boolean
  openOnClick?: boolean
  inline?: boolean

  positioning?: DatePickerPositioning

  onValueChange?: DatePickerValueChangeHandler
  onOpenChange?: DatePickerOpenChangeHandler
  onFocusChange?: DatePickerFocusChangeHandler
  onViewChange?: DatePickerViewChangeHandler
  onVisibleRangeChange?: DatePickerVisibleRangeChangeHandler
}
