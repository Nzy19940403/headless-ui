# Themes

Switch with `document.documentElement.dataset.theme = '<name>'`.

## File layout

```text
packages/theme/src/
  index.css                 # entry: @import themes + components
  components.css            # shared component skins (--ui-* only)
  themes/
    default.css             # data-theme=default (+ :root)
    compact.css
    industry.css
    industry-dark.css
  themes.md                 # this file
```

| File | `data-theme` | Role |
| --- | --- | --- |
| `themes/default.css` | `default` | Product baseline |
| `themes/compact.css` | `compact` | Dense purple accent |
| `themes/industry.css` | `industry` | Industrial IoT light (日班) |
| `themes/industry-dark.css` | `industry-dark` | Industrial IoT dark (夜班) |

## Rules

1. **Per-theme files only set CSS variables** (`--ui-*`). No component selectors.
2. **`components.css` only uses `var(--ui-*)`**. No theme-specific hardcodes.
3. **New theme**: add `themes/<name>.css`, then `@import` it from `index.css`.
4. Prefer importing `@demo/ui-theme` (index). Optional: import a single theme file + `components.css` if you need a subset.

## Industry mapping (highlights)

| Token | industry | industry-dark |
| --- | --- | --- |
| `--ui-color-primary` | `#1890FF` | `#1677FF` |
| `--ui-color-text` | `#000000` | `#E8EDF5` |
| `--ui-color-canvas-soft` | `#F0F5F9` | `#0B121C` |
| `--ui-color-surface` | `#FFFFFF` | `#141E2D` |
| `--ui-color-sidebar` | `#FAFBFC` | `#111A28` |
| `--ui-color-hairline` | `#DDE4E6` | `#263040` |
| `--ui-radius-control` | `4.5px` | `6px` |
| `--ui-control-height` | `30px` | `30px` |
| `--ui-shadow-sm` | flat `1.5px` | darker soft |

## Usage

```html
<html data-theme="industry">
```

```ts
document.documentElement.dataset.theme = 'industry-dark'
```
