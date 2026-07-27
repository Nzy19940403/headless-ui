# Button

Core contract file: `packages/core/src/button-contract.ts`.

Core contract: `ButtonContract`。

## Props

| Name | Type | Default |
| --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'ghost'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `disabled` | `boolean` | `false` |

React 使用 `<HButton>内容</HButton>`，Vue 使用默认 slot，Web Component 使用 `<h-button>内容</h-button>`。
三端都透传原生 click 行为。

