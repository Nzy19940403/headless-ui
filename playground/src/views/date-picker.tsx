import { useState, type ReactNode } from 'react'
import { defineComponent, h, ref } from 'vue'
import { HDatePicker } from '@demo/ui-react'
import { HDatePicker as VueHDatePicker } from '@demo/ui-vue'
import { mountWc } from '../wc-mount'
import { ComponentPage } from './ComponentPage'
import type { DatePickerContract } from '@demo/ui-core'
import type { ViewDefinition } from './types'

type DatePickerExample = {
  key: string
  title: string
  description: string
  resultLabel?: string
  initialValue?: string[]
  props: DatePickerContract
  wcPropsAfterMount?: Partial<DatePickerContract>
}

const examples: DatePickerExample[] = [
  {
    key: 'basic',
    title: 'Basic',
    description: 'Default calendar popup. Use this to check single-date selection and stale selected styles.',
    props: { label: 'Start date', placeholder: 'YYYY-MM-DD' },
  },
  {
    key: 'default-value',
    title: 'Default Value',
    description: 'Initial uncontrolled value, matching Ark UI defaultValue examples.',
    initialValue: ['2026-07-15'],
    props: { label: 'Published at', placeholder: 'YYYY-MM-DD', defaultValue: ['2026-07-15'] },
  },
  {
    key: 'controlled',
    title: 'Controlled',
    description: 'Value is controlled by the host and updated through onValueChange.',
    initialValue: ['2026-07-10'],
    props: { label: 'Controlled date', placeholder: 'YYYY-MM-DD', value: ['2026-07-10'] },
  },
  {
    key: 'default-view',
    title: 'Default View',
    description: 'Open the picker in the month view first.',
    props: { label: 'Choose month first', placeholder: 'YYYY-MM-DD', defaultView: 'month' },
  },
  {
    key: 'range',
    title: 'Range',
    description: 'Range uses two DatePicker inputs, following Ark UI anatomy instead of reusing the basic input.',
    resultLabel: 'Range',
    props: {
      label: 'Travel dates',
      placeholder: 'Start - end',
      selectionMode: 'range',
    },
  },
  {
    key: 'multiple',
    title: 'Multiple',
    description: 'Selected dates are rendered inside the picker control as removable tags, like Ark UI multiple-value demos.',
    resultLabel: 'Dates',
    props: {
      label: 'Reminder days',
      placeholder: 'Pick dates',
      selectionMode: 'multiple',
      closeOnSelect: false,
    },
    wcPropsAfterMount: { closeOnSelect: false },
  },
  {
    key: 'max-selected-dates',
    title: 'Max Selected Dates',
    description: 'Multiple selection capped at three dates, with the same in-control removable tag display.',
    resultLabel: 'Dates',
    props: {
      label: 'Pick up to 3',
      placeholder: 'Pick dates',
      selectionMode: 'multiple',
      maxSelectedDates: 3,
      closeOnSelect: false,
    },
    wcPropsAfterMount: { closeOnSelect: false },
  },
  {
    key: 'multiple-months',
    title: 'Multiple Months',
    description: 'Use numOfMonths to exercise the visible range and table structure.',
    props: { label: 'Two-month range', placeholder: 'YYYY-MM-DD', numOfMonths: 2 },
  },
  {
    key: 'min-max',
    title: 'Min and Max',
    description: 'Dates outside July 10-25, 2026 should be disabled.',
    props: { label: 'Booking date', placeholder: 'YYYY-MM-DD', min: '2026-07-10', max: '2026-07-25' },
  },
  {
    key: 'locale',
    title: 'Locale',
    description: 'Chinese locale with Monday as the first day of the week.',
    props: { label: 'Localized date', placeholder: 'YYYY-MM-DD', locale: 'zh-CN', startOfWeek: 1 },
  },
  {
    key: 'month-picker',
    title: 'Month Picker',
    description: 'Month-only picker using defaultView="month" and minView="month".',
    props: { label: 'Billing month', placeholder: 'YYYY-MM', defaultView: 'month', minView: 'month' },
  },
  {
    key: 'year-picker',
    title: 'Year Picker',
    description: 'Year-only picker using defaultView="year" and minView="year".',
    props: { label: 'Fiscal year', placeholder: 'YYYY', defaultView: 'year', minView: 'year' },
  },
  {
    key: 'inline',
    title: 'Inline',
    description: 'Render the calendar inline instead of as a popup.',
    initialValue: ['2026-07-20'],
    props: { label: 'Inline calendar', placeholder: 'YYYY-MM-DD', inline: true, defaultValue: ['2026-07-20'] },
  },
  {
    key: 'fixed-weeks',
    title: 'Fixed Weeks',
    description: 'Always render six weeks and show week numbers to avoid layout shifts.',
    props: { label: 'Stable calendar', placeholder: 'YYYY-MM-DD', fixedWeeks: true, showWeekNumbers: true },
  },
  {
    key: 'form',
    title: 'Form',
    description: 'Provide name so selected value can participate in native form data.',
    props: { label: 'Form date', name: 'bookingDate', placeholder: 'YYYY-MM-DD' },
  },
]

function formatValue(value: string[]) {
  return value.length ? value.join(', ') : '(none)'
}

function ReactDatePickerExample({ example }: { example: DatePickerExample }) {
  const [value, setValue] = useState<string[]>(example.initialValue ?? example.props.value ?? [])
  const [open, setOpen] = useState(false)
  const controlledProps = example.props.value !== undefined ? { value } : {}

  return (
    <div className="demo-stack">
      <HDatePicker
        {...example.props}
        {...controlledProps}
        id={`react-date-picker-${example.key}`}
        onValueChange={details => setValue(details.value)}
        onOpenChange={details => setOpen(details.open)}
      />
      <span className="demo-result">
        {example.resultLabel ?? 'Value'}: {formatValue(value)} | Open: {String(open)}
      </span>
    </div>
  )
}

function createVueDatePickerExample(example: DatePickerExample) {
  return defineComponent({
    name: `VueDatePicker${example.key.replace(/(^|-)([a-z])/g, (_, __, char: string) => char.toUpperCase())}`,
    setup() {
      const value = ref<string[]>(example.initialValue ?? example.props.value ?? [])
      const open = ref(false)

      return () => {
        const controlledProps = example.props.value !== undefined ? { value: value.value } : {}

        return h('div', { class: 'demo-stack' }, [
          h(VueHDatePicker, {
            ...example.props,
            ...controlledProps,
            id: `vue-date-picker-${example.key}`,
            onValueChange: (details: { value: string[] }) => {
              value.value = details.value
            },
            onOpenChange: (details: { open: boolean }) => {
              open.value = details.open
            },
          }),
          h(
            'span',
            { class: 'demo-result' },
            `${example.resultLabel ?? 'Value'}: ${formatValue(value.value)} | Open: ${String(open.value)}`,
          ),
        ])
      }
    },
  })
}

function toAttrName(key: string) {
  return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function toWcAttrs(props: DatePickerContract) {
  return Object.entries(props)
    .filter(([key, value]) => key !== 'onValueChange' && key !== 'onOpenChange' && value !== undefined && value !== false)
    .map(([key, value]) => {
      const attr = toAttrName(key)
      if (value === true) return attr
      if (Array.isArray(value)) return `${attr}="${value.join(',')}"`
      return `${attr}="${String(value)}"`
    })
    .join(' ')
}

function DatePickerWebExample({ example }: { example: DatePickerExample }) {
  return (
    <div
      className="demo-stack"
      ref={root => {
        mountWc(
          root,
          `
            <h-date-picker id="wc-date-picker-${example.key}" data-demo="${example.key}" ${toWcAttrs(example.props)}></h-date-picker>
            <span class="demo-result">${example.resultLabel ?? 'Value'}: ${formatValue(example.initialValue ?? example.props.value ?? [])} | Open: false</span>
          `,
          host => {
            const el = host.querySelector<HTMLElement & DatePickerContract>('h-date-picker')
            const out = host.querySelector<HTMLElement>('.demo-result')
            if (!el || !out) return

            Object.assign(el, example.wcPropsAfterMount)

            let value = example.initialValue ?? example.props.value ?? []
            let open = false

            const paint = () => {
              out.textContent = `${example.resultLabel ?? 'Value'}: ${formatValue(value)} | Open: ${String(open)}`
            }

            paint()

            el.addEventListener('value-change', event => {
              value = (event as CustomEvent<{ value: string[] }>).detail?.value ?? []
              if (example.props.value !== undefined) {
                el.value = value
              }
              paint()
            })
            el.addEventListener('open-change', event => {
              open = Boolean((event as CustomEvent<{ open: boolean }>).detail?.open)
              paint()
            })
          },
        )
      }}
    />
  )
}

const componentExamples = examples.map(example => ({
  title: example.title,
  description: example.description,
  reactDemo: <ReactDatePickerExample example={example} />,
  vueDemo: createVueDatePickerExample(example),
  webDemo: <DatePickerWebExample example={example} />,
}))

const firstExample = componentExamples[0]

export default function DatePickerView() {
  const definition: ViewDefinition = {
    apiKey: 'datePicker',
    title: 'Date Picker',
    description:
      'ISO string[] value from Core. React/Vue use Ark DatePicker. WC uses Lit + Zag and mirrors the same contract.',
    reactDemo: firstExample.reactDemo as ReactNode,
    vueDemo: firstExample.vueDemo,
    webDemo: firstExample.webDemo,
    examples: componentExamples,
  }
  return <ComponentPage {...definition} />
}
