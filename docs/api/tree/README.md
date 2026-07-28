# Tree (`HTree`)

Core: `packages/core/src/tree-contract.ts`  
Engine: **Ark UI / Zag TreeView** + **TanStack Virtual** (default).

Visible rows are flattened with `getVisibleNodes()` (respecting expand state), then virtualized so large equipment/org trees stay smooth.

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `nodes` | `TreeNodeContract[]` | required |
| `label` | `string` | - |
| `selectionMode` | `'single' \| 'multiple'` | `'single'` |
| `expandedValue` / `defaultExpandedValue` | `string[]` | - |
| `selectedValue` / `defaultSelectedValue` | `string[]` | - |
| `virtual` | `boolean` | `true` |
| `height` | `number \| string` | `360` |
| `rowHeight` | `number` | `32` |
| `overscan` | `number` | `8` |
| `expandOnClick` | `boolean` | `true` |

### `TreeNodeContract`

| Field | Type |
| --- | --- |
| `id` | `string` |
| `label` | `string` |
| `children?` | `TreeNodeContract[]` |
| `disabled?` | `boolean` |

## Events

| Event | Payload |
| --- | --- |
| `expanded-change` | `{ expandedValue: string[] }` |
| `selection-change` | `{ selectedValue: string[] }` |

## Architecture

```text
nodes → TreeCollection (synthetic root)
     → Zag expanded state
     → getVisibleNodes() flat list
     → TanStack Virtual window
     → BranchControl / Item rows (indent by depth)
```

`scrollToIndexFn` bridges keyboard focus to the virtualizer.

## Stacks

| Stack | Implementation |
| --- | --- |
| React | Ark `useTreeView` + `@tanstack/react-virtual` |
| Vue | Ark `useTreeView` + `@tanstack/vue-virtual` |
| WC | **Zag** `treeView.machine` + `connect(machine.service)` + `@tanstack/virtual-core` |

### WC notes

- Visible rows: `api.getVisibleNodes()` (filter synthetic root).
- Virtual window: TanStack Virtual; empty `getVirtualItems()` falls back to first page so spacer is never blank before layout measure.
- Full row rebuild only when the visible-id list changes; selection/focus only patch attributes (avoids “click leaf → parent selected”).
- Indent: `treeRowPaddingLeft(indexPath)` after `spreadProps` (Zag item `style` is only `--depth`).
- **Do not spread Zag root `id` onto the host** — `getRootProps().id` is a machine-scoped id and will overwrite author `id="…"` used by `querySelector`. Strip `id` before `spreadProps(host, rootProps)` and restore the author id if needed.
