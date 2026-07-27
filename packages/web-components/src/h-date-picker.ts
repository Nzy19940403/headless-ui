import { LitElement, html, nothing } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import * as datePicker from '@zag-js/date-picker'
import { parse as parseDate } from '@zag-js/date-picker'
import { VanillaMachine, normalizeProps, spreadProps } from '@zag-js/vanilla'
import type {
  DatePickerContract,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerSelectionMode,
  DatePickerValue,
  DatePickerValueChangeDetails,
  DatePickerView,
  DatePickerViewChangeDetails,
  DatePickerVisibleRangeChangeDetails,
  DatePickerWeekStart,
} from '@demo/ui-core'
import {
  defineOnce,
  type Cleanup,
  emitDetail,
  asDetailHandler,
  upgradeDetailHandlerProperties,
  type DetailHandler,
} from './compound'

type DateValue = import('@zag-js/date-picker').DateValue

function toDateValues(iso?: DatePickerValue | null): DateValue[] | undefined {
  if (iso == null) return undefined
  if (!iso.length) return []
  return parseDate(iso)
}

function toIsoList(value: DateValue[] | undefined): string[] {
  if (!value?.length) return []
  return value.map(v => v.toString())
}

function mapValueChange(details: datePicker.ValueChangeDetails): DatePickerValueChangeDetails {
  const value = toIsoList(details.value)
  return {
    value,
    valueAsString: details.valueAsString?.length ? details.valueAsString : value,
    view: details.view,
  }
}

const isoListConverter = {
  fromAttribute(value: string | null): DatePickerValue | undefined {
    if (value === null) return undefined
    if (!value.trim()) return []
    return value.split(',').map(item => item.trim()).filter(Boolean)
  },
  toAttribute(value: DatePickerValue | undefined): string | null {
    if (value === undefined) return null
    return value.join(',')
  },
}

/**
 * Lit + Zag DatePicker.
 *
 * Lit owns only stable structure (weeks/months/years/current view).
 * Zag remains the source of truth for interaction state and writes all aria/data-* props.
 */
export class HDatePicker extends LitElement {
  static properties = {
    label: { type: String },
    name: { type: String },
    placeholder: { type: String },
    value: { converter: isoListConverter },
    defaultValue: { attribute: 'default-value', converter: isoListConverter },
    open: { type: Boolean },
    defaultOpen: { type: Boolean, attribute: 'default-open' },
    disabled: { type: Boolean, reflect: true },
    readOnly: { type: Boolean, attribute: 'readonly' },
    required: { type: Boolean },
    invalid: { type: Boolean },
    min: { type: String },
    max: { type: String },
    locale: { type: String },
    timeZone: { type: String, attribute: 'time-zone' },
    selectionMode: { type: String, attribute: 'selection-mode' },
    maxSelectedDates: { type: Number, attribute: 'max-selected-dates' },
    view: { type: String },
    defaultView: { type: String, attribute: 'default-view' },
    minView: { type: String, attribute: 'min-view' },
    maxView: { type: String, attribute: 'max-view' },
    numOfMonths: { type: Number, attribute: 'num-of-months' },
    startOfWeek: { type: Number, attribute: 'start-of-week' },
    fixedWeeks: { type: Boolean, attribute: 'fixed-weeks' },
    showWeekNumbers: { type: Boolean, attribute: 'show-week-numbers' },
    outsideDaySelectable: { type: Boolean, attribute: 'outside-day-selectable' },
    closeOnSelect: { type: Boolean, attribute: 'close-on-select' },
    openOnClick: { type: Boolean, attribute: 'open-on-click' },
    inline: { type: Boolean },
    positioning: { type: String },
  }

  declare label: string | undefined
  declare name: string | undefined
  declare placeholder: string
  declare value: DatePickerValue | undefined
  declare defaultValue: DatePickerValue | undefined
  declare open: boolean | undefined
  declare defaultOpen: boolean | undefined
  declare disabled: boolean
  declare readOnly: boolean
  declare required: boolean
  declare invalid: boolean
  declare min: string | undefined
  declare max: string | undefined
  declare locale: string | undefined
  declare timeZone: string | undefined
  declare selectionMode: DatePickerSelectionMode
  declare maxSelectedDates: number | undefined
  declare view: DatePickerView | undefined
  declare defaultView: DatePickerView | undefined
  declare minView: DatePickerView | undefined
  declare maxView: DatePickerView | undefined
  declare numOfMonths: number | undefined
  declare startOfWeek: DatePickerWeekStart | undefined
  declare fixedWeeks: boolean
  declare showWeekNumbers: boolean
  declare outsideDaySelectable: boolean
  declare closeOnSelect: boolean
  declare openOnClick: boolean
  declare inline: boolean
  declare positioning: 'top' | 'bottom' | 'left' | 'right'

  private _onValueChange?: DetailHandler<DatePickerValueChangeDetails>
  private _onOpenChange?: DetailHandler<DatePickerOpenChangeDetails>
  private _onFocusChange?: DetailHandler<DatePickerFocusChangeDetails>
  private _onViewChange?: DetailHandler<DatePickerViewChangeDetails>
  private _onVisibleRangeChange?: DetailHandler<DatePickerVisibleRangeChangeDetails>

  get onValueChange() {
    return this._onValueChange
  }
  set onValueChange(handler: DetailHandler<DatePickerValueChangeDetails> | null | undefined) {
    this._onValueChange = asDetailHandler(handler)
  }
  get onOpenChange() {
    return this._onOpenChange
  }
  set onOpenChange(handler: DetailHandler<DatePickerOpenChangeDetails> | null | undefined) {
    this._onOpenChange = asDetailHandler(handler)
  }
  get onFocusChange() {
    return this._onFocusChange
  }
  set onFocusChange(handler: DetailHandler<DatePickerFocusChangeDetails> | null | undefined) {
    this._onFocusChange = asDetailHandler(handler)
  }
  get onViewChange() {
    return this._onViewChange
  }
  set onViewChange(handler: DetailHandler<DatePickerViewChangeDetails> | null | undefined) {
    this._onViewChange = asDetailHandler(handler)
  }
  get onVisibleRangeChange() {
    return this._onVisibleRangeChange
  }
  set onVisibleRangeChange(handler: DetailHandler<DatePickerVisibleRangeChangeDetails> | null | undefined) {
    this._onVisibleRangeChange = asDetailHandler(handler)
  }

  private service?: VanillaMachine<any>
  private unsubscribe?: Cleanup

  private snapView: DatePickerView = 'day'
  private snapOpen = false
  private snapWeeks: DateValue[][] = []
  private snapWeekDays: Array<{ short: string }> = []
  private snapMonths: Array<Array<{ label: string; value: number }>> = []
  private snapYears: Array<Array<{ label: string; value: number }>> = []
  private snapWeekNumbers: number[] = []
  private snapRangeText = ''
  private snapValue: DateValue[] = []
  private structureKey = ''
  private structureUpdateRequested = false

  constructor() {
    super()
    this.placeholder = 'Pick a date'
    this.disabled = false
    this.readOnly = false
    this.required = false
    this.invalid = false
    this.selectionMode = 'single'
    this.fixedWeeks = false
    this.showWeekNumbers = false
    this.outsideDaySelectable = false
    this.closeOnSelect = true
    this.openOnClick = false
    this.inline = false
    this.positioning = 'bottom'
  }

  protected createRenderRoot() {
    return this
  }

  connectedCallback() {
    upgradeDetailHandlerProperties(this)
    this.classList.add('ui-date-picker')
    this.startMachine()
    super.connectedCallback()
  }

  disconnectedCallback() {
    this.stopMachine()
    super.disconnectedCallback()
  }

  protected shouldUpdate(changed: Map<PropertyKey, unknown>) {
    if (!this.service) return true

    this.pushPublicPropsToMachine(changed)

    if (this.structureUpdateRequested) {
      this.structureUpdateRequested = false
      return true
    }

    return (
      changed.has('label') ||
      changed.has('placeholder') ||
      changed.has('showWeekNumbers') ||
      this.structureKey === ''
    )
  }

  protected firstUpdated() {
    this.bindAllZagProps()
  }

  protected updated() {
    this.bindAllZagProps()
  }

  private machinePropsFromHost(): datePicker.Props {
    const props: datePicker.Props = {
      id: `h-date-picker-${this.id || crypto.randomUUID()}`,
      disabled: this.disabled,
      readOnly: this.readOnly,
      required: this.required,
      invalid: this.invalid,
      selectionMode: this.selectionMode,
      fixedWeeks: this.fixedWeeks,
      showWeekNumbers: this.showWeekNumbers,
      outsideDaySelectable: this.outsideDaySelectable,
      closeOnSelect: this.closeOnSelect,
      openOnClick: this.openOnClick,
      inline: this.inline,
      positioning: { placement: this.positioning },
      onValueChange: details => {
        const payload = mapValueChange(details)
        emitDetail(this, 'value-change', payload, this._onValueChange)
        if (JSON.stringify(this.value) !== JSON.stringify(payload.value)) {
          this.value = payload.value
        }
        this.captureStructure(true)
      },
      onOpenChange: details => {
        const payload: DatePickerOpenChangeDetails = {
          open: details.open,
          value: toIsoList(details.value),
        }
        emitDetail(this, 'open-change', payload, this._onOpenChange)
        this.captureStructure(true)
      },
      onFocusChange: details => {
        const base = mapValueChange(details)
        const payload: DatePickerFocusChangeDetails = {
          ...base,
          focusedValue: details.focusedValue?.toString?.() ?? '',
        }
        emitDetail(this, 'focus-change', payload, this._onFocusChange)
      },
      onViewChange: details => {
        emitDetail(this, 'view-change', details as DatePickerViewChangeDetails, this._onViewChange)
        this.captureStructure(true)
      },
      onVisibleRangeChange: details => {
        const payload: DatePickerVisibleRangeChangeDetails = {
          view: details.view,
          visibleRange: {
            start: details.visibleRange.start.toString(),
            end: details.visibleRange.end.toString(),
          },
        }
        emitDetail(this, 'visible-range-change', payload, this._onVisibleRangeChange)
        this.captureStructure(true)
      },
    }

    if (this.name !== undefined) props.name = this.name
    if (this.placeholder !== undefined) props.placeholder = this.placeholder
    if (this.value !== undefined) props.value = toDateValues(this.value)
    if (this.defaultValue !== undefined) props.defaultValue = toDateValues(this.defaultValue)
    if (this.open !== undefined) props.open = this.open
    if (this.defaultOpen !== undefined) props.defaultOpen = this.defaultOpen
    if (this.min) props.min = parseDate(this.min)
    if (this.max) props.max = parseDate(this.max)
    if (this.locale !== undefined) props.locale = this.locale
    if (this.timeZone !== undefined) props.timeZone = this.timeZone
    if (this.maxSelectedDates !== undefined) props.maxSelectedDates = this.maxSelectedDates
    if (this.view !== undefined) props.view = this.view
    if (this.defaultView !== undefined) props.defaultView = this.defaultView
    if (this.minView !== undefined) props.minView = this.minView
    if (this.maxView !== undefined) props.maxView = this.maxView
    if (this.numOfMonths !== undefined) props.numOfMonths = this.numOfMonths
    if (this.startOfWeek !== undefined) props.startOfWeek = this.startOfWeek

    return props
  }

  private startMachine() {
    if (this.service) return
    this.service = new VanillaMachine(datePicker.machine, this.machinePropsFromHost())
    this.service.start()
    this.unsubscribe = this.service.subscribe(() => this.onMachineTick())
    this.captureStructure(true)
  }

  private stopMachine() {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.service?.stop()
    this.service = undefined
  }

  private getApi() {
    if (!this.service) return null
    return datePicker.connect(this.service.service, normalizeProps)
  }

  private pushPublicPropsToMachine(changed: Map<PropertyKey, unknown>) {
    if (!this.service) return

    const patch: Record<string, unknown> = {}
    if (changed.has('value')) patch.value = toDateValues(this.value)
    if (changed.has('defaultValue')) patch.defaultValue = toDateValues(this.defaultValue)
    if (changed.has('open')) patch.open = this.open
    if (changed.has('defaultOpen')) patch.defaultOpen = this.defaultOpen
    if (changed.has('inline')) patch.inline = this.inline
    if (changed.has('disabled')) patch.disabled = this.disabled
    if (changed.has('readOnly')) patch.readOnly = this.readOnly
    if (changed.has('required')) patch.required = this.required
    if (changed.has('invalid')) patch.invalid = this.invalid
    if (changed.has('min')) patch.min = this.min ? parseDate(this.min) : undefined
    if (changed.has('max')) patch.max = this.max ? parseDate(this.max) : undefined
    if (changed.has('locale')) patch.locale = this.locale
    if (changed.has('timeZone')) patch.timeZone = this.timeZone
    if (changed.has('selectionMode')) patch.selectionMode = this.selectionMode
    if (changed.has('maxSelectedDates')) patch.maxSelectedDates = this.maxSelectedDates
    if (changed.has('view')) patch.view = this.view
    if (changed.has('defaultView')) patch.defaultView = this.defaultView
    if (changed.has('minView')) patch.minView = this.minView
    if (changed.has('maxView')) patch.maxView = this.maxView
    if (changed.has('numOfMonths')) patch.numOfMonths = this.numOfMonths
    if (changed.has('startOfWeek')) patch.startOfWeek = this.startOfWeek
    if (changed.has('fixedWeeks')) patch.fixedWeeks = this.fixedWeeks
    if (changed.has('showWeekNumbers')) patch.showWeekNumbers = this.showWeekNumbers
    if (changed.has('outsideDaySelectable')) patch.outsideDaySelectable = this.outsideDaySelectable
    if (changed.has('closeOnSelect')) patch.closeOnSelect = this.closeOnSelect
    if (changed.has('openOnClick')) patch.openOnClick = this.openOnClick
    if (changed.has('positioning')) patch.positioning = { placement: this.positioning }
    if (changed.has('name')) patch.name = this.name
    if (changed.has('placeholder')) patch.placeholder = this.placeholder
    if (Object.keys(patch).length) this.service.updateProps(patch)
  }

  private onMachineTick() {
    this.captureStructure(false)
    this.bindAllZagProps()
  }

  private removeSelectedDate(event: Event, index: number) {
    event.preventDefault()
    event.stopPropagation()

    const api = this.getApi()
    if (!api) return

    api.setValue(this.snapValue.filter((_, itemIndex) => itemIndex !== index))
    this.captureStructure(true)
    this.bindAllZagProps()
  }

  private captureStructure(force: boolean) {
    const api = this.getApi()
    if (!api) return

    const view = api.view as DatePickerView
    const open = api.open
    const weeks = api.weeks as DateValue[][]
    const weekDays = api.weekDays as Array<{ short: string }>
    const weekNumbers = weeks.map(week => api.getWeekNumber(week))
    const months = api.getMonthsGrid({ columns: 4, format: 'short' }) as Array<Array<{ label: string; value: number }>>
    const years = api.getYearsGrid({ columns: 4 }) as Array<Array<{ label: string; value: number }>>
    const value = api.value as DateValue[]
    const rangeText = api.visibleRangeText?.start
      ? `${api.visibleRangeText.start}${api.visibleRangeText.end ? ` - ${api.visibleRangeText.end}` : ''}`
      : ''

    const key = [
      view,
      open,
      weeks.flat().map(d => d.toString()).join(','),
      months.flat().map(m => m.value).join(','),
      years.flat().map(y => y.value).join(','),
      value.map(date => date.toString()).join(','),
      rangeText,
      this.showWeekNumbers,
    ].join('|')

    if (!force && key === this.structureKey) return

    this.structureKey = key
    this.snapView = view
    this.snapOpen = open
    this.snapWeeks = weeks
    this.snapWeekDays = weekDays
    this.snapWeekNumbers = weekNumbers
    this.snapMonths = months
    this.snapYears = years
    this.snapRangeText = rangeText
    this.snapValue = value
    this.structureUpdateRequested = true
    this.requestUpdate()
  }

  private bindAllZagProps() {
    const api = this.getApi()
    if (!api) return

    const bind = (el: Element | null, props: Record<string, unknown>) => {
      if (!el) return
      spreadProps(el, props)
    }

    bind(this, api.getRootProps())
    bind(this.querySelector('[data-part="label"]'), api.getLabelProps())
    bind(this.querySelector('[data-part="control"]'), api.getControlProps())
    this.querySelectorAll('[data-part="input"]').forEach((input, index) => {
      bind(input, api.getInputProps({ index }))
    })
    bind(this.querySelector('[data-part="trigger"]'), api.getTriggerProps())
    bind(this.querySelector('[data-part="clear-trigger"]'), api.getClearTriggerProps())
    bind(this.querySelector('[data-part="positioner"]'), api.getPositionerProps())
    bind(this.querySelector('[data-part="content"]'), api.getContentProps())

    for (const view of ['day', 'month', 'year'] as DatePickerView[]) {
      bind(this.querySelector(`[data-part="view"][data-view="${view}"]`), api.getViewProps({ view }))
      bind(this.querySelector(`[data-part="view-control"][data-view="${view}"]`), api.getViewControlProps({ view }))
      bind(this.querySelector(`[data-part="prev-trigger"][data-view="${view}"]`), api.getPrevTriggerProps({ view }))
      bind(this.querySelector(`[data-part="next-trigger"][data-view="${view}"]`), api.getNextTriggerProps({ view }))
      bind(this.querySelector(`[data-part="view-trigger"][data-view="${view}"]`), api.getViewTriggerProps({ view }))
      bind(this.querySelector(`[data-part="table"][data-view="${view}"]`), api.getTableProps({ view }))
      bind(this.querySelector(`[data-part="table-head"][data-view="${view}"]`), api.getTableHeadProps({ view }))
      bind(this.querySelector(`[data-part="table-body"][data-view="${view}"]`), api.getTableBodyProps({ view }))
    }

    bind(this.querySelector('[data-week-number-header]'), api.getWeekNumberHeaderCellProps())

    this.querySelectorAll<HTMLElement>('[data-week-number-cell]').forEach(cell => {
      const weekIndex = Number(cell.dataset.weekIndex)
      const week = this.snapWeeks[weekIndex]
      if (!week || Number.isNaN(weekIndex)) return
      bind(cell, api.getWeekNumberCellProps({ weekIndex, week }))
    })

    this.querySelectorAll<HTMLElement>('[data-cell-kind="day"]').forEach(cell => {
      const value = cell.dataset.value
      if (!value) return
      try {
        const day = parseDate(value)
        bind(cell, api.getDayTableCellProps({ value: day }))
        bind(cell.querySelector('[data-cell-kind="day-trigger"]'), api.getDayTableCellTriggerProps({ value: day }))
      } catch {
        /* ignore invalid generated dates */
      }
    })

    this.querySelectorAll<HTMLElement>('[data-cell-kind="month"]').forEach(cell => {
      const value = Number(cell.dataset.value)
      if (Number.isNaN(value)) return
      bind(cell, api.getMonthTableCellProps({ value }))
      bind(cell.querySelector('[data-cell-kind="month-trigger"]'), api.getMonthTableCellTriggerProps({ value }))
    })

    this.querySelectorAll<HTMLElement>('[data-cell-kind="year"]').forEach(cell => {
      const value = Number(cell.dataset.value)
      if (Number.isNaN(value)) return
      bind(cell, api.getYearTableCellProps({ value }))
      bind(cell.querySelector('[data-cell-kind="year-trigger"]'), api.getYearTableCellTriggerProps({ value }))
    })
  }

  protected render() {
    const view = this.snapView

    return html`
      ${this.label ? html`<label data-part="label" class="ui-field__label">${this.label}</label>` : nothing}
      <div data-part="control" class="ui-date-picker__control">
        ${this.selectionMode === 'multiple'
          ? html`
              <div data-part="selected-dates" class="ui-date-picker__selected-dates">
                ${this.snapValue.length
                  ? repeat(
                      this.snapValue,
                      date => date.toString(),
                      (date, index) => html`
                        <span class="ui-date-picker__selected-date">
                          ${date.toString()}
                          <button
                            type="button"
                            class="ui-date-picker__selected-remove"
                            aria-label=${`Remove ${date.toString()}`}
                            @click=${(event: Event) => this.removeSelectedDate(event, index)}
                          >
                            x
                          </button>
                        </span>
                      `,
                    )
                  : html`<span class="ui-date-picker__selected-placeholder">${this.placeholder}</span>`}
              </div>
            `
          : this.selectionMode === 'range'
          ? html`
              <input data-part="input" class="ui-date-picker__input" placeholder="Start" />
              <input data-part="input" class="ui-date-picker__input" placeholder="End" />
            `
          : html`<input data-part="input" class="ui-date-picker__input" placeholder=${this.placeholder} />`}
        <button type="button" data-part="trigger" class="ui-date-picker__trigger">Calendar</button>
        <button type="button" data-part="clear-trigger" class="ui-date-picker__clear">Clear</button>
      </div>
      <div data-part="positioner" class="ui-date-picker__positioner">
        <div data-part="content" class="ui-date-picker__content">
          <div data-part="view" data-view="day" class="ui-date-picker__view" ?hidden=${view !== 'day'}>
            <div data-part="view-control" data-view="day" class="ui-date-picker__view-control">
              <button type="button" data-part="prev-trigger" data-view="day" class="ui-date-picker__nav">Prev</button>
              <button type="button" data-part="view-trigger" data-view="day" class="ui-date-picker__view-trigger">
                ${this.snapRangeText}
              </button>
              <button type="button" data-part="next-trigger" data-view="day" class="ui-date-picker__nav">Next</button>
            </div>
            <table data-part="table" data-view="day" class="ui-date-picker__table">
              <thead data-part="table-head" data-view="day">
                <tr>
                  ${this.showWeekNumbers
                    ? html`<th
                        data-part="table-cell"
                        data-week-number-header
                        class="ui-date-picker__th ui-date-picker__th--week"
                      >
                        #
                      </th>`
                    : nothing}
                  ${repeat(
                    this.snapWeekDays,
                    (weekday, index) => `${weekday.short}-${index}`,
                    weekday => html`<th class="ui-date-picker__th">${weekday.short}</th>`,
                  )}
                </tr>
              </thead>
              <tbody data-part="table-body" data-view="day">
                ${repeat(
                  this.snapWeeks,
                  (week, weekIndex) => `${week.map(day => day.toString()).join(',')}-${weekIndex}`,
                  (week, weekIndex) => html`
                    <tr>
                      ${this.showWeekNumbers
                        ? html`<td
                            data-week-number-cell
                            data-week-index=${weekIndex}
                            class="ui-date-picker__td ui-date-picker__week"
                          >
                            ${this.snapWeekNumbers[weekIndex] ?? ''}
                          </td>`
                        : nothing}
                      ${repeat(
                        week,
                        day => day.toString(),
                        day => html`
                          <td
                            data-part="table-cell"
                            data-cell-kind="day"
                            data-value=${day.toString()}
                            class="ui-date-picker__td"
                          >
                            <button
                              type="button"
                              data-part="table-cell-trigger"
                              data-cell-kind="day-trigger"
                              class="ui-date-picker__day"
                            >
                              ${day.day}
                            </button>
                          </td>
                        `,
                      )}
                    </tr>
                  `,
                )}
              </tbody>
            </table>
          </div>

          <div data-part="view" data-view="month" class="ui-date-picker__view" ?hidden=${view !== 'month'}>
            <div data-part="view-control" data-view="month" class="ui-date-picker__view-control">
              <button type="button" data-part="prev-trigger" data-view="month" class="ui-date-picker__nav">Prev</button>
              <button type="button" data-part="view-trigger" data-view="month" class="ui-date-picker__view-trigger">
                ${this.snapRangeText}
              </button>
              <button type="button" data-part="next-trigger" data-view="month" class="ui-date-picker__nav">Next</button>
            </div>
            <table data-part="table" data-view="month" class="ui-date-picker__table">
              <tbody data-part="table-body" data-view="month">
                ${repeat(
                  this.snapMonths,
                  (row, index) => `${row.map(month => month.value).join(',')}-${index}`,
                  row => html`
                    <tr>
                      ${repeat(
                        row,
                        month => String(month.value),
                        month => html`
                          <td
                            data-part="table-cell"
                            data-cell-kind="month"
                            data-value=${month.value}
                            class="ui-date-picker__td"
                          >
                            <button
                              type="button"
                              data-part="table-cell-trigger"
                              data-cell-kind="month-trigger"
                              class="ui-date-picker__cell"
                            >
                              ${month.label}
                            </button>
                          </td>
                        `,
                      )}
                    </tr>
                  `,
                )}
              </tbody>
            </table>
          </div>

          <div data-part="view" data-view="year" class="ui-date-picker__view" ?hidden=${view !== 'year'}>
            <div data-part="view-control" data-view="year" class="ui-date-picker__view-control">
              <button type="button" data-part="prev-trigger" data-view="year" class="ui-date-picker__nav">Prev</button>
              <button type="button" data-part="view-trigger" data-view="year" class="ui-date-picker__view-trigger">
                ${this.snapRangeText}
              </button>
              <button type="button" data-part="next-trigger" data-view="year" class="ui-date-picker__nav">Next</button>
            </div>
            <table data-part="table" data-view="year" class="ui-date-picker__table">
              <tbody data-part="table-body" data-view="year">
                ${repeat(
                  this.snapYears,
                  (row, index) => `${row.map(year => year.value).join(',')}-${index}`,
                  row => html`
                    <tr>
                      ${repeat(
                        row,
                        year => String(year.value),
                        year => html`
                          <td
                            data-part="table-cell"
                            data-cell-kind="year"
                            data-value=${year.value}
                            class="ui-date-picker__td"
                          >
                            <button
                              type="button"
                              data-part="table-cell-trigger"
                              data-cell-kind="year-trigger"
                              class="ui-date-picker__cell"
                            >
                              ${year.label}
                            </button>
                          </td>
                        `,
                      )}
                    </tr>
                  `,
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
  }
}

export type HDatePickerProps = DatePickerContract
defineOnce('h-date-picker', HDatePicker)
