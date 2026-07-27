import { DatePicker, parseDate } from '@ark-ui/react/date-picker'
import type {
  DatePickerContract,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerValue,
  DatePickerValueChangeDetails,
  DatePickerViewChangeDetails,
  DatePickerVisibleRangeChangeDetails,
} from '@demo/ui-core'

export interface HDatePickerProps extends DatePickerContract {}

function toDateValues(iso?: DatePickerValue) {
  if (iso === undefined) return undefined
  if (!iso.length) return []
  return parseDate(iso)
}

function toIsoList(value: Array<{ toString(): string } | string> | undefined): string[] {
  if (!value?.length) return []
  return value.map(v => (typeof v === 'string' ? v : v.toString()))
}

function mapValueChange(details: {
  value: Array<{ toString(): string }>
  valueAsString: string[]
  view: DatePickerValueChangeDetails['view']
}): DatePickerValueChangeDetails {
  const value = toIsoList(details.value)
  return {
    value,
    valueAsString: details.valueAsString?.length ? details.valueAsString : value,
    view: details.view,
  }
}

export function HDatePicker({
  id,
  label,
  name,
  placeholder = 'Pick a date',
  value,
  defaultValue,
  open,
  defaultOpen,
  disabled,
  readOnly,
  required,
  invalid,
  min,
  max,
  locale,
  timeZone,
  selectionMode = 'single',
  maxSelectedDates,
  view,
  defaultView,
  minView,
  maxView,
  numOfMonths,
  startOfWeek,
  fixedWeeks,
  showWeekNumbers,
  outsideDaySelectable,
  closeOnSelect,
  openOnClick,
  inline,
  positioning = 'bottom',
  onValueChange,
  onOpenChange,
  onFocusChange,
  onViewChange,
  onVisibleRangeChange,
}: HDatePickerProps) {
  return (
    <DatePicker.Root
      className="ui-date-picker"
      id={id}
      name={name}
      value={toDateValues(value)}
      defaultValue={toDateValues(defaultValue)}
      open={open}
      defaultOpen={defaultOpen}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      invalid={invalid}
      min={min ? parseDate(min) : undefined}
      max={max ? parseDate(max) : undefined}
      locale={locale}
      timeZone={timeZone}
      selectionMode={selectionMode}
      maxSelectedDates={maxSelectedDates}
      view={view}
      defaultView={defaultView}
      minView={minView}
      maxView={maxView}
      numOfMonths={numOfMonths}
      startOfWeek={startOfWeek}
      fixedWeeks={fixedWeeks}
      showWeekNumbers={showWeekNumbers}
      outsideDaySelectable={outsideDaySelectable}
      closeOnSelect={closeOnSelect}
      openOnClick={openOnClick}
      inline={inline}
      positioning={{ placement: positioning }}
      onValueChange={details => onValueChange?.(mapValueChange(details))}
      onOpenChange={details =>
        onOpenChange?.({
          open: details.open,
          value: toIsoList(details.value),
        } satisfies DatePickerOpenChangeDetails)
      }
      onFocusChange={details => {
        const base = mapValueChange(details)
        onFocusChange?.({
          ...base,
          focusedValue: details.focusedValue?.toString?.() ?? String(details.focusedValue ?? ''),
        } satisfies DatePickerFocusChangeDetails)
      }}
      onViewChange={details => onViewChange?.(details as DatePickerViewChangeDetails)}
      onVisibleRangeChange={details =>
        onVisibleRangeChange?.({
          view: details.view,
          visibleRange: {
            start: details.visibleRange.start.toString(),
            end: details.visibleRange.end.toString(),
          },
        } satisfies DatePickerVisibleRangeChangeDetails)
      }
    >
      {label ? <DatePicker.Label className="ui-field__label">{label}</DatePicker.Label> : null}
      <DatePicker.Control className="ui-date-picker__control">
        {selectionMode === 'multiple' ? (
          <DatePicker.Context>
            {datePicker => (
              <div className="ui-date-picker__selected-dates">
                {datePicker.value.length === 0 ? (
                  <span className="ui-date-picker__selected-placeholder">{placeholder}</span>
                ) : (
                  datePicker.value.map((date, index) => (
                    <span key={date.toString()} className="ui-date-picker__selected-date">
                      {date.toString()}
                      <button
                        type="button"
                        className="ui-date-picker__selected-remove"
                        aria-label={`Remove ${date.toString()}`}
                        onClick={() => datePicker.setValue(datePicker.value.filter((_, itemIndex) => itemIndex !== index))}
                      >
                        x
                      </button>
                    </span>
                  ))
                )}
              </div>
            )}
          </DatePicker.Context>
        ) : selectionMode === 'range' ? (
          <>
            <DatePicker.Input index={0} className="ui-date-picker__input" placeholder="Start" />
            <DatePicker.Input index={1} className="ui-date-picker__input" placeholder="End" />
          </>
        ) : (
          <DatePicker.Input className="ui-date-picker__input" placeholder={placeholder} />
        )}
        <DatePicker.Trigger className="ui-date-picker__trigger" type="button">
          Calendar
        </DatePicker.Trigger>
        <DatePicker.ClearTrigger className="ui-date-picker__clear" type="button">
          Clear
        </DatePicker.ClearTrigger>
      </DatePicker.Control>
      <DatePicker.Positioner className="ui-date-picker__positioner">
        <DatePicker.Content className="ui-date-picker__content">
          <DatePicker.View view="day" className="ui-date-picker__view">
            <DatePicker.Context>
              {datePicker => (
                <>
                  <DatePicker.ViewControl className="ui-date-picker__view-control">
                    <DatePicker.PrevTrigger className="ui-date-picker__nav" type="button">
                      Prev
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger className="ui-date-picker__view-trigger" type="button">
                      <DatePicker.RangeText />
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger className="ui-date-picker__nav" type="button">
                      Next
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table className="ui-date-picker__table">
                    <DatePicker.TableHead>
                      <DatePicker.TableRow>
                        {showWeekNumbers ? (
                          <DatePicker.WeekNumberHeaderCell className="ui-date-picker__th ui-date-picker__th--week">
                            #
                          </DatePicker.WeekNumberHeaderCell>
                        ) : null}
                        {datePicker.weekDays.map((weekDay, id) => (
                          <DatePicker.TableHeader key={id} className="ui-date-picker__th">
                            {weekDay.short}
                          </DatePicker.TableHeader>
                        ))}
                      </DatePicker.TableRow>
                    </DatePicker.TableHead>
                    <DatePicker.TableBody>
                      {datePicker.weeks.map((week, id) => (
                        <DatePicker.TableRow key={id}>
                          {showWeekNumbers ? (
                            <DatePicker.WeekNumberCell
                              weekIndex={id}
                              week={week}
                              className="ui-date-picker__td ui-date-picker__week"
                            >
                              {datePicker.getWeekNumber(week)}
                            </DatePicker.WeekNumberCell>
                          ) : null}
                          {week.map((day, dayId) => (
                            <DatePicker.TableCell key={dayId} value={day} className="ui-date-picker__td">
                              <DatePicker.TableCellTrigger className="ui-date-picker__day">
                                {day.day}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>

          <DatePicker.View view="month" className="ui-date-picker__view">
            <DatePicker.Context>
              {datePicker => (
                <>
                  <DatePicker.ViewControl className="ui-date-picker__view-control">
                    <DatePicker.PrevTrigger className="ui-date-picker__nav" type="button">
                      Prev
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger className="ui-date-picker__view-trigger" type="button">
                      <DatePicker.RangeText />
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger className="ui-date-picker__nav" type="button">
                      Next
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table className="ui-date-picker__table">
                    <DatePicker.TableBody>
                      {datePicker.getMonthsGrid({ columns: 4, format: 'short' }).map((months, id) => (
                        <DatePicker.TableRow key={id}>
                          {months.map((month, monthId) => (
                            <DatePicker.TableCell key={monthId} value={month.value} className="ui-date-picker__td">
                              <DatePicker.TableCellTrigger className="ui-date-picker__cell">
                                {month.label}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>

          <DatePicker.View view="year" className="ui-date-picker__view">
            <DatePicker.Context>
              {datePicker => (
                <>
                  <DatePicker.ViewControl className="ui-date-picker__view-control">
                    <DatePicker.PrevTrigger className="ui-date-picker__nav" type="button">
                      Prev
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger className="ui-date-picker__view-trigger" type="button">
                      <DatePicker.RangeText />
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger className="ui-date-picker__nav" type="button">
                      Next
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table className="ui-date-picker__table">
                    <DatePicker.TableBody>
                      {datePicker.getYearsGrid({ columns: 4 }).map((years, id) => (
                        <DatePicker.TableRow key={id}>
                          {years.map((year, yearId) => (
                            <DatePicker.TableCell key={yearId} value={year.value} className="ui-date-picker__td">
                              <DatePicker.TableCellTrigger className="ui-date-picker__cell">
                                {year.label}
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  )
}
