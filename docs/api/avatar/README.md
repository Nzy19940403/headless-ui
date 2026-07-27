# Avatar

Core: `packages/core/src/avatar-contract.ts`

| Prop | Type | Default |
| --- | --- | --- |
| `src` | `string` | - |
| `alt` | `string` | `''` |
| `fallback` | `string` | first two letters from `alt`, or `?` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |

Web Component may receive `src`/`fallback` attributes or light DOM image/fallback parts.
