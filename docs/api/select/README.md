# Select

Core: `packages/core/src/select-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `items` | `{ value: string; label: string; disabled?: boolean }[]` | required |
| `value` | `string` | - |
| `defaultValue` / `default-value` | `string` | - |
| `placeholder` | `string` | `'Select...'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | - |
| `label` | `string` | - |

Value change events use `{ value: string }` on all stacks:

| Stack | Event / callback |
| --- | --- |
| React | `onValueChange({ value })` |
| Vue | `value-change` / `update:value` |
| Web Component | `value-change` CustomEvent `detail: { value }` |

### Web Component notes

`h-select` is implemented with **Lit + Zag select** (not native `<select>`), so open/highlight/keyboard behavior can align with React/Vue Ark Select.

- Pass `items` as a JSON attribute or set the `items` property to an array.
- Theme uses light DOM + shared `ui-select*` classes from `@demo/ui-theme`.
- See `packages/web-components/src/lit-policy.md` for when other WC components should adopt Lit.
