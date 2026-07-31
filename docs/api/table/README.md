# Table (`HTable`)

Core: `packages/core/src/table-contract.ts`

Headless data table powered by **TanStack Table** (`@tanstack/react-table` / `vue-table` / `lit-table`).  
Core owns the cross-stack API; TanStack owns sorting / pagination row models.

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `TableColumnContract[]` | required |
| `data` | `Record<string, unknown>[]` | required |
| `fillHeight` | `boolean` | `false`; consumes the definite block-size offered by the parent layout |
| `enableSorting` | `boolean` | `true` |
| `sorting` / `defaultSorting` | `{ id: string; desc: boolean }[]` | - |
| `enablePagination` | `boolean` | `false` |
| `pageSize` | `number` | `10` |
| `pagination` / `defaultPagination` | `{ pageIndex; pageSize }` | - |
| `padEmptyRows` | `boolean` | `true` when pagination is on |
| `density` | `'comfortable' \| 'compact'` | `'comfortable'` |
| `textAlign` | `'left' \| 'center' \| 'right'` | `'left'`; table-wide default text alignment |
| `emptyText` | `string` | `'No data'` |
| `loading` | `boolean` | `false` |
| `caption` | `string` | - |
| `enableExpanding` | `boolean` | `false` |
| `expanded` / `defaultExpanded` | `true \| Record<string, boolean>` | `{}` |
| `resizeable` | `boolean` | `false`; enables live header resize handles |
| `enableColumnResizing` | `boolean` | deprecated alias for `resizeable` |
| `columnResizeMode` | `'onChange' \| 'onEnd'` | `'onChange'` |
| `columnSizing` / `defaultColumnSizing` | `Record<string, number>` | - |
| `draggable` | `boolean` | `false`; enables non-pinned header drag ordering via the adapter's dnd-kit integration |
| `enableColumnOrdering` | `boolean` | deprecated alias for `draggable` |
| `columnOrder` / `defaultColumnOrder` | `string[]` | - |
| `lazyMount` | `boolean` | `true`; delays Presence-backed detail mounting until first expansion |
| `unmountOnExit` | `boolean` | `false`; removes Presence-backed detail content after its exit transition |

### Layout stability

- Theme fixes body row height via `--ui-table-row-height` (comfortable `48px`, compact `36px`).
- When `enablePagination` is on, `padEmptyRows` (default true) fills missing rows on the last page so table height does not jump.
- `fillHeight` makes the table and its scroll region fill the parent height. Put it inside a parent with a definite height, preferably `HVStack fillHeight`; keep `min-height: 0` on every flex/grid layer between the viewport and table.

### `TableColumnContract`

| Field | Type | Notes |
| --- | --- | --- |
| `accessorKey` | `string` | row field key |
| `header` | `string` | header label |
| `id` | `string` | defaults to `accessorKey` |
| `enableSorting` | `boolean` | optional per-column |
| `size` / `minSize` | `number` | optional width px (stable columns) |
| `maxSize` | `number` | maximum width when resizing |
| `enableResizing` | `boolean` | per-column resize override |
| `enableOrdering` | `boolean` | per-column drag-order override |
| `cellType` | `TableCellType` | presentation hint (serializable; WC-safe) |
| `align` | `'left' \| 'center' \| 'right'` | legacy alias; defaults to table `textAlign` |
| `textAlign` | `'left' \| 'center' \| 'right'` | column-level alignment; overrides table `textAlign` and legacy `align` |
| `pinned` | `'left' \| 'right'` | keeps the column visible during horizontal scroll |

### `cellType`

| Value | Render |
| --- | --- |
| `text` (default) | plain string, ellipsis |
| `number` | `toLocaleString()`, tabular nums |
| `tag` | status-colored `ui-tag` (React/Vue: `HTag`) |
| `badge` | status-colored `ui-badge` (React/Vue: `HBadge`) |
| `progress` | 0–100 bar + label (React/Vue: `HProgress`) |
| `datetime` | localized date-time |
| `boolean` | Yes/No tag |

Tone heuristics for tag/badge: keywords like active/done → success, pending/away → warning, blocked/error → danger, review → info.

Custom `ColumnDef.cell` renderers are **not** in Core. React can pass `columnDefs` escape hatch on `HTable` for fully custom TanStack columns.

React expansion details are rendered with the `renderExpanded(row)` escape hatch and can be gated with `getRowCanExpand(row)`. Because the callback returns `ReactNode`, it can render a nested `HTable` as a child table. The serializable Core state is shared; Vue/Web Component detail-slot renderers remain a follow-up adapter surface.

## Events

| Details | Shape |
| --- | --- |
| sorting-change | `{ sorting: { id; desc }[] }` |
| pagination-change | `{ pagination: { pageIndex; pageSize } }` |
| column-sizing-change | `{ sizing: Record<string, number> }` |
| column-order-change | `{ order: string[] }` |
| expanded-change | `{ expanded: true \| Record<string, boolean> }` |

| Stack | API |
| --- | --- |
| React | `onSortingChange` / `onPaginationChange` / `onColumnSizingChange` / `onColumnOrderChange` / `onExpandedChange` |
| Vue | `sorting-change` / `pagination-change` / `column-sizing-change` / `column-order-change` / `expanded-change` |
| Web Component | callback properties or CustomEvents for `sorting-change`, `pagination-change`, `column-sizing-change`, `column-order-change`, `expanded-change` |

## Renderers

| Stack | Package |
| --- | --- |
| React | `@tanstack/react-table` → `HTable` |
| Vue | `@tanstack/vue-table` → `HTable` |
| Web Component | `@tanstack/lit-table` (`TableController`) → `h-table` |

Theme classes: `ui-table`, `ui-table--comfortable` / `ui-table--compact`, `ui-table__th`, `ui-table__td`, `ui-table__tr--pad`, `ui-table__cell--*`, …

Offline TanStack docs for AI: `docs/ai/tanstack-table/`.
