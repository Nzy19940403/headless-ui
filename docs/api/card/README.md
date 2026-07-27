# Card

Core contract file: `packages/core/src/card-contract.ts`.

Core contract: `CardContract<TContent>`。

| Name | Type | Default |
| --- | --- | --- |
| `title` | `TContent` | - |
| `description` | `TContent` | - |
| `variant` | `'surface' \| 'muted'` | `'surface'` |

React/Vue 分别使用 `title`、`description` 属性；Web Component 可使用同名属性，或在 light DOM 中提供 `.ui-card__header`、`.ui-card__title` 和 `.ui-card__description` 结构。
业务内容分别通过 children、默认 slot 和 light DOM 提供。

