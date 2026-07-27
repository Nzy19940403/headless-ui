# Accordion

Core contract file: `packages/core/src/accordion-contract.ts`.

Core contract: `AccordionContract<TContent>` 和 `AccordionItemContract<TContent>`。

| Name | Type | Default |
| --- | --- | --- |
| `items` | `{ value: string; title: TContent; content: TContent }[]` | required |
| `multiple` | `boolean` | `false` |
| `defaultValue` | `string[]` | `[]` |
| `value` | `string[]` | uncontrolled |

事件：`value-change`，payload 为 `{ value: string[] }`。

React 使用 `onValueChange(details)`，Vue 使用 `@value-change`。Web Component 使用 `multiple`、`value` 和 `default-value` 属性；数组属性在 HTML attribute 中用逗号分隔，例如 `default-value="one,two"`。每个 item 需要有 `data-value`，并提供 trigger、content、indicator 对应的 `data-part`。

