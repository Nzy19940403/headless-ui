# Tabs

Core contract file: `packages/core/src/tabs-contract.ts`.

Core contract: `TabsContract<TContent>` 和 `TabsItemContract<TContent>`。

| Name | Type | Default |
| --- | --- | --- |
| `items` | `{ value: string; label: string; content: TContent }[]` | required |
| `defaultValue` | `string` | first available value |
| `value` | `string` | uncontrolled |

事件：`value-change`，payload 为 `{ value: string }`。

React 使用 `onValueChange(details)`，Vue 使用 `@value-change`。Web Component 使用 `value`、`default-value` 属性，并在 `data-part="trigger"` 和 `data-part="content"` 节点上通过 `data-value` 标识 tab。

