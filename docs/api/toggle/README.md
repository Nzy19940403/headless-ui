# Toggle

Core contract file: `packages/core/src/toggle-contract.ts`.

Core contract: `ToggleContract`。

| Name | Type | Default |
| --- | --- | --- |
| `checked` | `boolean` | uncontrolled |
| `defaultChecked` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |

事件：`checked-change`，payload 为 `{ checked: boolean }`。

- React：`onCheckedChange(details)`
- Vue：`@checked-change="details => ..."`
- Web Component：`addEventListener('checked-change', event => event.detail.checked)`

Web Component 属性使用 `checked`、`default-checked` 和 `disabled`。页面仍需提供 `data-part="control"`、`data-part="thumb"`、`data-part="label"` 和 `data-part="hidden-input"`。

