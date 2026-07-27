# Web Components + Lit policy

## Goal

React/Vue use Ark UI compound trees. Web Components need an equivalent **render layer** for complex anatomy (portal-like layers, lists, indicators) while keeping:

1. The same Core contract (`SelectContract`, events as details objects)
2. Shared `@demo/ui-theme` skins (prefer **light DOM**, not closed Shadow DOM)
3. Zag machines for behavior / a11y when the component is stateful

## When to use Lit

| Use Lit | Keep hand-written `HTMLElement` / Zag enhance |
| --- | --- |
| Component **creates** multi-part markup (Select, rich Tooltip, Menu, Combobox, DatePicker) | Light-DOM enhancement only (Toggle, Checkbox, Tabs, Accordion, Dialog, RadioGroup) |
| Options / lists re-render from props often | Presentational skins (Badge, Skeleton, Separator, Tag, Button, Card) |
| Need template + reactive props without reimplementing DOM diffing | Tiny self-rendering widgets still fine (Input, Progress, Empty, Avatar) |

**First Lit target:** `h-select` (Zag select + Lit anatomy).  
**Next candidates:** `h-tooltip` (if arrow/delay/portal parity needed), then Menu / Combobox / Drawer content shells.

## Rules

1. **Light DOM by default** — override `createRenderRoot()` to `return this` so `packages/theme` global CSS applies. Introduce Shadow DOM only with a deliberate CSS strategy (`::part` / adoptedStyleSheets).
2. **Zag owns behavior** — Lit renders structure; after each update, `spreadProps` from `connect()`.
3. **API parity** — props and `value-change` / `open-change` / `checked-change` payloads must match Core; no native-only shortcuts that change the public contract.
4. **Do not Lit-wash everything** — simple components stay hand-written to keep the package small.
5. **No reactive class-field initializers** — do **not** write `items: Item[] = []` on Lit elements. Native fields shadow Lit accessors and break rendering (`class-field-shadowing`). Use `declare items: Item[]` + set defaults in `constructor()`, or Lit decorators with `useDefineForClassFields: false` (already set in this package's `tsconfig.json`).
6. **Do not `requestUpdate()` on every Zag tick** — hover/highlight updates fire the machine often. Full Lit re-renders wipe floating-ui inline styles on positioners (menus “collapse”). Subscribe → `spreadProps` / small DOM patches only; re-render when public props (`items`, `label`, …) change.
7. **Use `shouldUpdate()` as the render gate** — structural/display props may render (`items`, `label`, `placeholder`). State props should update Zag and patch DOM without rendering (`value`, `open`, `highlightedValue`, `disabled`, `name`).
8. **Patch changed nodes, not the list** — on hover/highlight, patch only previous and next highlighted nodes. On selection, patch previous and next selected nodes. Do not loop through every option on pointermove/keydown.
9. **Use keyed `repeat()` for generated lists** — for options, menu items, tree nodes, or any stateful repeated DOM, use `repeat(items, item => item.value, ...)` so Lit keeps key-to-DOM mapping stable when data is inserted, removed, or reordered.
10. **Batch public data, patch machine state** — Lit already batches reactive property updates before paint. Do not recreate a custom batching layer unless measurement shows a problem.

11. **Do not cleanup `spreadProps` before routine re-bind** - `@zag-js/vanilla` uses previous attrs to remove stale `data-selected`, `data-state`, `hidden`, etc. Calling the returned cleanup before every sync deletes that memory and can leave old CSS state attrs on old nodes. See `docs/ai/wc-zag-spread-props-rule.txt`.

## Source-grounded guidance

- Lit reactive updates are asynchronous and batched; default property change detection is strict equality. Use this to keep object/array references stable when callers do not intend to render.
- `shouldUpdate(changedProperties)` is the official render gate. Returning `false` skips the rest of the update cycle while still resolving `updateComplete`.
- `repeat()` is the official keyed list directive for stable DOM identity. Prefer it when rendered items can move, be inserted, be removed, or hold DOM state.

References:

- https://lit.dev/docs/components/lifecycle/
- https://lit.dev/docs/templates/lists/
- https://lit.dev/docs/api/directives/#repeat

## Adding a Lit component checklist

1. Contract in `packages/core/src/*-contract.ts`
2. React + Vue Ark renderers already match the contract
3. Lit element under `packages/web-components/src/h-*.ts`
4. Theme classes only (`ui-*`), no hard-coded brand colors
5. Playground demo for three stacks
6. Note in `docs/api/<component>/README.md` if WC uses Lit+Zag
