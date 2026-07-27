# Drawer (`HDrawer`)

Core: `packages/core/src/drawer-contract.ts`

Edge panel powered by **Ark UI Drawer** / **`@zag-js/drawer`**.  
Same open-state pattern as Dialog (`open` / `defaultOpen` / `onOpenChange`).

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `trigger` | content | required |
| `title` | content | required |
| `description` | content | - |
| `children` / default slot | body | - |
| `open` / `defaultOpen` | `boolean` | - |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` |
| `size` | CSS length | `'360px'` (width for L/R, height for T/B) |

## Events

| Details | Shape |
| --- | --- |
| open-change | `{ open: boolean }` |

| Stack | API |
| --- | --- |
| React | `onOpenChange` |
| Vue | `open-change` |
| WC | property `onOpenChange` + CustomEvent `open-change` |

## Placement → swipeDirection

| `placement` | Zag `swipeDirection` |
| --- | --- |
| `left` | `start` |
| `right` | `end` |
| `top` | `up` |
| `bottom` | `down` |

Theme classes: `ui-drawer__backdrop`, `ui-drawer__positioner--*`, `ui-drawer__content--*`.

## Animation

| Stack | Mechanism |
| --- | --- |
| React / Vue | Ark **Presence** (`lazyMount` + `unmountOnExit`). Theme CSS animates `[data-state=open\|closed]`. Presence waits for `animationend`, then fires `exitcomplete` for Zag’s `closing` state. |
| WC | No Ark Presence. On close we keep the panel visible, set `data-state=closed`, listen for **`animationend`**, then dispatch **`exitcomplete`** so `@zag-js/drawer` can leave `closing` → `closed`. |

Do **not** use `display: none` on `data-state=closed` or exit animations never run.

## Renderers

| Stack | Path |
| --- | --- |
| React | `packages/react/src/HDrawer.tsx` |
| Vue | `packages/vue/src/HDrawer.vue` |
| WC | `packages/web-components/src/h-drawer.ts` (`h-drawer` + light DOM parts) |
