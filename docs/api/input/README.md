# Input

Core: `packages/core/src/input-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `label` | `string` | - |
| `placeholder` | `string` | - |
| `value` | `string` | - |
| `defaultValue` / `default-value` | `string` | - |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'search' \| 'tel' \| 'url'` | `'text'` |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `readOnly` / `readonly` | `boolean` | `false` |
| `error` | `string` | - |
| `helperText` / `helper-text` | `string` | - |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `name` | `string` | - |

Value change events use `{ value: string }`.
