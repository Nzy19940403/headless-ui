# Table (`HTable`)

Core: `packages/core/src/table-contract.ts`

Headless data table powered by **TanStack Table** (`@tanstack/react-table` / `vue-table` / `lit-table`).  
Core owns the cross-stack API; TanStack owns sorting / pagination row models.

## Props

| Prop | Type | Default |
| --- | --- | --- |
| `columns` | `TableColumnContract[]` | required |
| `data` | `Record<string, unknown>[]` | required |
| `enableSorting` | `boolean` | `true` |
| `sorting` / `defaultSorting` | `{ id: string; desc: boolean }[]` | - |
| `enablePagination` | `boolean` | `false` |
| `pageSize` | `number` | `10` |
| `pagination` / `defaultPagination` | `{ pageIndex; pageSize }` | - |
| `padEmptyRows` | `boolean` | `true` when pagination is on |
| `density` | `'comfortable' \| 'compact'` | `'comfortable'` |
| `emptyText` | `string` | `'No data'` |
| `loading` | `boolean` | `false` |
| `caption` | `string` | - |

### Layout stability

- Theme fixes body row height via `--ui-table-row-height` (comfortable `48px`, compact `36px`).
- When `enablePagination` is on, `padEmptyRows` (default true) fills missing rows on the last page so table height does not jump.

### `TableColumnContract`

| Field | Type | Notes |
| --- | --- | --- |
| `accessorKey` | `string` | row field key |
| `header` | `string` | header label |
| `id` | `string` | defaults to `accessorKey` |
| `enableSorting` | `boolean` | optional per-column |
| `size` / `minSize` | `number` | optional width px (stable columns) |
| `cellType` | `TableCellType` | presentation hint (serializable; WC-safe) |
| `align` | `'left' \| 'center' \| 'right'` | defaults by cellType (`number`/`progress` → right) |

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

## Events

| Details | Shape |
| --- | --- |
| sorting-change | `{ sorting: { id; desc }[] }` |
| pagination-change | `{ pagination: { pageIndex; pageSize } }` |

| Stack | API |
| --- | --- |
| React | `onSortingChange` / `onPaginationChange` |
| Vue | `sorting-change` / `pagination-change` |
| Web Component | property `onSortingChange` / `onPaginationChange` + CustomEvents `sorting-change` / `pagination-change` |

## Renderers

| Stack | Package |
| --- | --- |
| React | `@tanstack/react-table` → `HTable` |
| Vue | `@tanstack/vue-table` → `HTable` |
| Web Component | `@tanstack/lit-table` (`TableController`) → `h-table` |

Theme classes: `ui-table`, `ui-table--comfortable` / `ui-table--compact`, `ui-table__th`, `ui-table__td`, `ui-table__tr--pad`, `ui-table__cell--*`, …

Offline TanStack docs for AI: `docs/ai/tanstack-table/`.
