# Form controls — MeshFlow-ready checklist

H* form fields are **stateless about cross-field logic**. MeshFlow (later) owns linkage; fields only accept controlled props and emit change details.

## Required field API

| Concern | Convention |
|--------|------------|
| Controlled value | `value` + `onValueChange` (or `checked` + `onCheckedChange`) |
| Uncontrolled init | `defaultValue` / `defaultChecked` only |
| Field key | `name?: string` |
| Linkage knobs | `disabled` / `readOnly` / `error` / `helperText` from outside |
| Payload | Core details objects — same on React / Vue / WC |

### Vue adapter caveat

Core names stay React-style (`value` / `defaultValue`). Ark Vue often expects **`modelValue`** (and sometimes has no `defaultValue` on the leaf Input). Wrappers in `packages/vue` must map; do not raw-forward. See `vue-value-model-binding-rules.md`.

## Payload shapes

- String fields: `{ value: string }` — Input, Textarea, Select, Combobox, Radio, Segment, NumberInput (string number), Password
- Number fields: `{ value: number }` — Slider (single thumb)
- Boolean fields: `{ checked: boolean }` — Checkbox, Toggle

## Do not put in H*

- Cross-field enable/disable rules
- Schema validation engines
- Form submit orchestration

## Current form pack

Already: Input, Select, Radio, Checkbox, Toggle  
Added: Textarea, NumberInput, PasswordInput, Combobox, Slider, SegmentGroup
