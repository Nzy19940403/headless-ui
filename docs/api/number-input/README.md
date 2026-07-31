# Number Input

Core: `packages/core/src/number-input-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `label` | `string` | - |
| `value` | `string` | - (controlled) |
| `defaultValue` / `default-value` | `string` | - |
| `min` / `max` / `step` | `number` | Zag defaults |
| `disabled` | `boolean` | `false` |
| `readOnly` / `readonly` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `name` | `string` | - |
| `error` | `string` | - |
| `helperText` / `helper-text` | `string` | - |
| `formatOptions` / `format-options` | `Intl.NumberFormatOptions` | - |
| `allowMouseWheel` / `allow-mouse-wheel` | `boolean` | `false` |
| `scrubber` | `boolean` | `false` (show drag handle) |

Value change events use `{ value: string }` on all stacks.

### Playground demos (Ark control parity)

| Section | Ark example |
| --- | --- |
| Basic | basic |
| Min and Max | min-max |
| Precision | fraction-digits |
| Scrubber | scrubber |
| Mouse wheel | mouse-wheel |
| Formatting | formatting (currency) |
| Controlled | controlled (+ Set 0 / Set 50) |

**Not demoed:** Field helper / error / required — form-layer (later MeshFlow). Contract props may still exist for form to drive later.

`RootProvider` is not wrapped as H* — use controlled `value` instead.

### Vue note

Ark Vue uses **`modelValue`**. `HNumberInput` maps Core `value` → `:model-value`.

### Caret

After focus and controlled value updates, caret is pinned to the **end** of the text (right edge of content in LTR).

### Web Component

- `format-options` attribute: JSON string, or set property `el.formatOptions = { … }`
- `allow-mouse-wheel`, `scrubber` as boolean attributes
- **Controlled:** start with `value` attribute (not only `default-value`). Update via `el.value = '50'` or `el.setValue('50')`. On `value-change`, write back `el.value = detail.value` if you own state.
- **Mouse wheel:** needs `allow-mouse-wheel` **and** focus on the field first
- **Scrubber:** needs `scrubber` attribute; drag the ⇄ handle
- Caret is pinned to the end while the input is focused (step / format rewrites)

Implementation notes (WC):
- Does **not** cleanup `spreadProps` on every machine tick (see `docs/ai/wc-zag-spread-props-rule.txt`)
- Machine boot is deferred one tick so host attributes are present
