# Segment Group

Core: `packages/core/src/segment-group-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{ value; label; disabled? }[]` | required |
| `value` | `string` | - (controlled) |
| `defaultValue` / `default-value` | `string` | - |
| `disabled` | `boolean` | `false` — whole group |
| `items[].disabled` | `boolean` | single segment |
| `fullWidth` / `full-width` | `boolean` | `false` — hug content; `true` = 100% width, equal segments |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `label` / `name` | `string` | - |

Value change: `{ value: string }` on all stacks.

| Stack | Bind | Change |
| --- | --- | --- |
| React | `value` / `defaultValue` | `onValueChange` |
| Vue | `v-model:value` / `defaultValue` | `update:value` / `value-change` |
| WC | `value` / `default-value` | `onValueChange` + `value-change` |

### Layout

- **Default:** control width fits content (`width: fit-content`).
- **`fullWidth`:** root + track are 100% of parent; each segment `flex: 1`.

### Vue note

Ark Vue uses `modelValue`. `HSegmentGroup` maps Core `value` → `:model-value`.
