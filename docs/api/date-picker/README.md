# DatePicker

Core: `packages/core/src/date-picker-contract.ts`

Public API uses **ISO date strings** (`string[]`). Zag/Ark `DateValue` is an implementation detail and is not part of Core.

| Prop | Type | Default / notes |
| --- | --- | --- |
| `label` | `string` | - |
| `name` | `string` | form field key |
| `placeholder` | `string` | - |
| `value` / `defaultValue` | `string[]` | single `['2026-07-27']`; range two values; multiple many |
| `open` / `defaultOpen` | `boolean` | - |
| `disabled` / `readOnly` / `required` / `invalid` | `boolean` | - |
| `min` / `max` | `string` (ISO) | - |
| `locale` / `timeZone` | `string` | - |
| `selectionMode` | `'single' \| 'multiple' \| 'range'` | `'single'` |
| `maxSelectedDates` | `number` | multiple mode |
| `view` / `defaultView` / `minView` / `maxView` | `'day' \| 'month' \| 'year'` | - |
| `numOfMonths` | `number` | - |
| `startOfWeek` | `0..6` | - |
| `fixedWeeks` / `showWeekNumbers` / `outsideDaySelectable` | `boolean` | - |
| `closeOnSelect` / `openOnClick` / `inline` | `boolean` | - |
| `positioning` | `'top' \| 'bottom' \| 'left' \| 'right'` | - |

## Events (details from Core)

| Details | Shape |
| --- | --- |
| value-change | `{ value: string[]; valueAsString: string[]; view }` |
| open-change | `{ open: boolean; value: string[] }` |
| focus-change | value-change + `{ focusedValue: string }` |
| view-change | `{ view }` |
| visible-range-change | `{ view; visibleRange: { start; end } }` |

| Stack | Callbacks / events |
| --- | --- |
| React | `onValueChange` / `onOpenChange` / `onFocusChange` / `onViewChange` / `onVisibleRangeChange` |
| Vue | kebab: `value-change`, `open-change`, `focus-change`, `view-change`, `visible-range-change` (+ `update:value` / `update:open`) |
| Web Component | same-named JS properties **and** kebab CustomEvents |

## Renderers

| Stack | Package | Notes |
| --- | --- | --- |
| React | `@ark-ui/react/date-picker` | `HDatePicker` |
| Vue | `@ark-ui/vue/date-picker` | `HDatePicker` |
| Web Component | Lit + `@zag-js/date-picker` | `h-date-picker`, light DOM, `ui-date-picker*` theme classes |

WC rules: Zag owns interaction state; Lit owns structure; do not invent parallel selected/open state.
