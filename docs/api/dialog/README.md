# Dialog (`HDialog`)

Core: `packages/core/src/dialog-contract.ts` · `DialogContract<TContent>`

Centered modal powered by **Ark UI Dialog** / **`@zag-js/dialog`**.

## Props

| Name | Type | Default |
| --- | --- | --- |
| `trigger` | `TContent` | required |
| `title` | `TContent` | required |
| `description` | `TContent` | - |
| `children` / default slot | body | - |
| `open` | `boolean` | uncontrolled when omitted |
| `defaultOpen` | `boolean` | `false` |
| `lazyMount` | `boolean` | `true` |
| `unmountOnExit` | `boolean` | `true` |
| `skipAnimationOnMount` | `boolean` | `false` |

## Events

| Details | Shape |
| --- | --- |
| open-change | `{ open: boolean }` |

| Stack | API |
| --- | --- |
| React | `onOpenChange({ open })` |
| Vue | `open-change` |
| WC | property `onOpenChange` + CustomEvent `open-change` |

## Animation

Same Presence + CSS pattern as Drawer:

| Stack | Mechanism |
| --- | --- |
| React / Vue | Ark **Presence**; `lazyMount`, `unmountOnExit`, and `skipAnimationOnMount` are forwarded. Theme keyframes on `[data-state=open\|closed]`: backdrop fade + content scale/fade. |
| WC | Dialog machine has **no** `closing`/`exitcomplete`. On close we keep nodes visible with `data-state=closed`, wait for **`animationend`**, then apply Zag `hidden`. |

Do **not** force `display: none` on every `data-state=closed` node — only after `[hidden]` (exit finished). Codex’s drawer fix: keep visible only for `closed:not([hidden])`.

Theme classes: `ui-dialog__backdrop`, `ui-dialog__positioner`, `ui-dialog__content` / `dialog-content`.

## Web Component light DOM

Provide parts: `trigger`, `backdrop`, `positioner`, `content`, `title`, `description`, `close-trigger` (via `data-part` or `h-dialog-*` tags).
