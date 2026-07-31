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

| Stack | Controlled | Uncontrolled init | Change |
| --- | --- | --- | --- |
| React | `value={v}` | `defaultValue` | `onValueChange({ value })` |
| Vue | `v-model:value` / `:value` | `default-value` / `defaultValue` | `update:value` / `value-change` |
| Web Component | `value` attr/prop | `default-value` | `value-change` / `onValueChange` |

### Playground demos

React / Vue / WC share the **same sections** (parity):

1. Basic (controlled) + live value
2. Uncontrolled (`defaultValue`)
3. Sizes (`sm` / `md` / `lg`)
4. Types (email / search / password / tel / url)
5. Disabled / readOnly

`helperText` / `error` / `required` remain on the contract (form chrome) but are **not** demoed on the Input page — drive them from a form layer later.

### Vue note（初值不显示时先看这里）

Ark Vue `Field.Input` **只认 `modelValue`**，没有 React/DOM 那套可透传的 `value` / `defaultValue`。

`HInput` 在包装层做了映射：

- controlled：`value` → `:model-value`
- uncontrolled：`defaultValue` → 初始 `:model-value`
- 对外仍用 Core 名：`value` / `defaultValue` / `update:value`

若自己写 Vue 包装或 fork 时直接 `:value` / `:default-value` 绑 Ark `Field.Input`，会出现 **React/WC 有初值、Vue 空白**。细则见：

`docs/ai/vue-value-model-binding-rules.md`

### Web Component

`default-value` / `value` 属性；变更用 `value-change`（`detail: { value }`）或 `onValueChange`（与 React 对齐）。
