<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { DatePicker, parseDate } from '@ark-ui/vue/date-picker'
import type {
  DatePickerContract,
  DatePickerFocusChangeDetails,
  DatePickerOpenChangeDetails,
  DatePickerValue,
  DatePickerValueChangeDetails,
  DatePickerViewChangeDetails,
  DatePickerVisibleRangeChangeDetails,
} from '@demo/ui-core'

const props = withDefaults(defineProps<DatePickerContract>(), {
  placeholder: 'Pick a date',
  selectionMode: 'single',
  positioning: 'bottom',
})

const emit = defineEmits<{
  'value-change': [details: DatePickerValueChangeDetails]
  'open-change': [details: DatePickerOpenChangeDetails]
  'focus-change': [details: DatePickerFocusChangeDetails]
  'view-change': [details: DatePickerViewChangeDetails]
  'visible-range-change': [details: DatePickerVisibleRangeChangeDetails]
  'update:value': [value: DatePickerValue]
  'update:open': [open: boolean]
}>()

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

const parsedValue = computed(() => toDateValues(props.value))
const parsedDefaultValue = computed(() => toDateValues(props.defaultValue))
const parsedMin = computed(() => (props.min ? parseDate(props.min) : undefined))
const parsedMax = computed(() => (props.max ? parseDate(props.max) : undefined))
const instance = getCurrentInstance()

const propAliases: Record<string, string[]> = {
  readOnly: ['readonly', 'read-only'],
}

function toKebabCase(key: string) {
  return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function hasProvidedProp(key: string) {
  const vnodeProps = instance?.vnode.props ?? {}
  return [key, toKebabCase(key), ...(propAliases[key] ?? [])].some(name =>
    Object.prototype.hasOwnProperty.call(vnodeProps, name),
  )
}

function setIfDefined(target: Record<string, unknown>, key: string, value: unknown) {
  if (value !== undefined) target[key] = value
}

function setIfProvided(target: Record<string, unknown>, key: string, value: unknown) {
  if (hasProvidedProp(key)) target[key] = value
}

const rootProps = computed(() => {
  const result: Record<string, unknown> = {
    selectionMode: props.selectionMode,
    positioning: { placement: props.positioning },
  }

  setIfDefined(result, 'id', props.id)
  setIfDefined(result, 'name', props.name)
  setIfDefined(result, 'modelValue', parsedValue.value)
  setIfDefined(result, 'defaultValue', parsedDefaultValue.value)
  setIfProvided(result, 'open', props.open)
  setIfProvided(result, 'defaultOpen', props.defaultOpen)
  setIfProvided(result, 'disabled', props.disabled)
  setIfProvided(result, 'readOnly', props.readOnly)
  setIfProvided(result, 'required', props.required)
  setIfProvided(result, 'invalid', props.invalid)
  setIfDefined(result, 'min', parsedMin.value)
  setIfDefined(result, 'max', parsedMax.value)
  setIfDefined(result, 'locale', props.locale)
  setIfDefined(result, 'timeZone', props.timeZone)
  setIfDefined(result, 'maxSelectedDates', props.maxSelectedDates)
  setIfDefined(result, 'view', props.view)
  setIfDefined(result, 'defaultView', props.defaultView)
  setIfDefined(result, 'minView', props.minView)
  setIfDefined(result, 'maxView', props.maxView)
  setIfDefined(result, 'numOfMonths', props.numOfMonths)
  setIfDefined(result, 'startOfWeek', props.startOfWeek)
  setIfProvided(result, 'fixedWeeks', props.fixedWeeks)
  setIfProvided(result, 'showWeekNumbers', props.showWeekNumbers)
  setIfProvided(result, 'outsideDaySelectable', props.outsideDaySelectable)
  setIfProvided(result, 'closeOnSelect', props.closeOnSelect)
  setIfProvided(result, 'openOnClick', props.openOnClick)
  setIfProvided(result, 'inline', props.inline)

  return result
})
</script>

<template>
  <DatePicker.Root
    class="ui-date-picker"
    v-bind="rootProps"
    @value-change="(details) => { const payload = mapValueChange(details); emit('value-change', payload); emit('update:value', payload.value) }"
    @open-change="(details) => { emit('open-change', { open: details.open, value: toIsoList(details.value) }); emit('update:open', details.open) }"
    @focus-change="(details) => { const payload = mapValueChange(details); emit('focus-change', { ...payload, focusedValue: details.focusedValue?.toString?.() ?? String(details.focusedValue ?? '') }) }"
    @view-change="(details) => emit('view-change', details)"
    @visible-range-change="(details) => emit('visible-range-change', { view: details.view, visibleRange: { start: details.visibleRange.start.toString(), end: details.visibleRange.end.toString() } })"
  >
    <DatePicker.Label v-if="label" class="ui-field__label">{{ label }}</DatePicker.Label>
    <DatePicker.Control class="ui-date-picker__control">
      <DatePicker.Context v-if="selectionMode === 'multiple'" v-slot="api">
        <div class="ui-date-picker__selected-dates">
          <span v-if="api.value.length === 0" class="ui-date-picker__selected-placeholder">
            {{ placeholder }}
          </span>
          <template v-else>
            <span
              v-for="(date, index) in api.value"
              :key="date.toString()"
              class="ui-date-picker__selected-date"
            >
              {{ date.toString() }}
              <button
                type="button"
                class="ui-date-picker__selected-remove"
                :aria-label="`Remove ${date.toString()}`"
                @click="api.setValue(api.value.filter((_, itemIndex) => itemIndex !== index))"
              >
                x
              </button>
            </span>
          </template>
        </div>
      </DatePicker.Context>
      <template v-else-if="selectionMode === 'range'">
        <DatePicker.Input :index="0" class="ui-date-picker__input" placeholder="Start" />
        <DatePicker.Input :index="1" class="ui-date-picker__input" placeholder="End" />
      </template>
      <DatePicker.Input v-else class="ui-date-picker__input" :placeholder="placeholder" />
      <DatePicker.Trigger class="ui-date-picker__trigger" type="button">Calendar</DatePicker.Trigger>
      <DatePicker.ClearTrigger class="ui-date-picker__clear" type="button">Clear</DatePicker.ClearTrigger>
    </DatePicker.Control>
    <Teleport to="body" :disabled="inline">
      <DatePicker.Positioner class="ui-date-picker__positioner">
        <DatePicker.Content class="ui-date-picker__content">
        <DatePicker.View view="day" class="ui-date-picker__view">
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl class="ui-date-picker__view-control">
              <DatePicker.PrevTrigger class="ui-date-picker__nav" type="button">Prev</DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger class="ui-date-picker__view-trigger" type="button">
                <DatePicker.RangeText />
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger class="ui-date-picker__nav" type="button">Next</DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table class="ui-date-picker__table">
              <DatePicker.TableHead>
                <DatePicker.TableRow>
                  <DatePicker.WeekNumberHeaderCell
                    v-if="showWeekNumbers"
                    class="ui-date-picker__th ui-date-picker__th--week"
                  >
                    #
                  </DatePicker.WeekNumberHeaderCell>
                  <DatePicker.TableHeader
                    v-for="(weekDay, id) in api.weekDays"
                    :key="id"
                    class="ui-date-picker__th"
                  >
                    {{ weekDay.short }}
                  </DatePicker.TableHeader>
                </DatePicker.TableRow>
              </DatePicker.TableHead>
              <DatePicker.TableBody>
                <DatePicker.TableRow v-for="(week, id) in api.weeks" :key="id">
                  <DatePicker.WeekNumberCell
                    v-if="showWeekNumbers"
                    :week-index="id"
                    :week="week"
                    class="ui-date-picker__td ui-date-picker__week"
                  >
                    {{ api.getWeekNumber(week) }}
                  </DatePicker.WeekNumberCell>
                  <DatePicker.TableCell
                    v-for="(day, dayId) in week"
                    :key="dayId"
                    :value="day"
                    class="ui-date-picker__td"
                  >
                    <DatePicker.TableCellTrigger class="ui-date-picker__day">
                      {{ day.day }}
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>

        <DatePicker.View view="month" class="ui-date-picker__view">
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl class="ui-date-picker__view-control">
              <DatePicker.PrevTrigger class="ui-date-picker__nav" type="button">Prev</DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger class="ui-date-picker__view-trigger" type="button">
                <DatePicker.RangeText />
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger class="ui-date-picker__nav" type="button">Next</DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table class="ui-date-picker__table">
              <DatePicker.TableBody>
                <DatePicker.TableRow
                  v-for="(months, id) in api.getMonthsGrid({ columns: 4, format: 'short' })"
                  :key="id"
                >
                  <DatePicker.TableCell
                    v-for="(month, monthId) in months"
                    :key="monthId"
                    :value="month.value"
                    class="ui-date-picker__td"
                  >
                    <DatePicker.TableCellTrigger class="ui-date-picker__cell">
                      {{ month.label }}
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>

        <DatePicker.View view="year" class="ui-date-picker__view">
          <DatePicker.Context v-slot="api">
            <DatePicker.ViewControl class="ui-date-picker__view-control">
              <DatePicker.PrevTrigger class="ui-date-picker__nav" type="button">Prev</DatePicker.PrevTrigger>
              <DatePicker.ViewTrigger class="ui-date-picker__view-trigger" type="button">
                <DatePicker.RangeText />
              </DatePicker.ViewTrigger>
              <DatePicker.NextTrigger class="ui-date-picker__nav" type="button">Next</DatePicker.NextTrigger>
            </DatePicker.ViewControl>
            <DatePicker.Table class="ui-date-picker__table">
              <DatePicker.TableBody>
                <DatePicker.TableRow v-for="(years, id) in api.getYearsGrid({ columns: 4 })" :key="id">
                  <DatePicker.TableCell
                    v-for="(year, yearId) in years"
                    :key="yearId"
                    :value="year.value"
                    class="ui-date-picker__td"
                  >
                    <DatePicker.TableCellTrigger class="ui-date-picker__cell">
                      {{ year.label }}
                    </DatePicker.TableCellTrigger>
                  </DatePicker.TableCell>
                </DatePicker.TableRow>
              </DatePicker.TableBody>
            </DatePicker.Table>
          </DatePicker.Context>
        </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </Teleport>
  </DatePicker.Root>
</template>
