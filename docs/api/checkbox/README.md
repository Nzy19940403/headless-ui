# Checkbox

Core contract file: `packages/core/src/checkbox-contract.ts`.

Core contract: `CheckboxContract`。

| Name | Type | Default |
| --- | --- | --- |
| `label` | `string` | required |
| `checked` | `boolean` | uncontrolled |
| `defaultChecked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

事件：`checked-change`，payload 为 `{ checked: boolean }`。

React 使用 `onCheckedChange(details)`，Vue 使用 `@checked-change`，Web Component 使用同名 CustomEvent。
Web Component 需要提供 `control`、`indicator`、`label` 和 `hidden-input` 四个 `data-part` 节点。

