# Layout primitives (`HContainer`, `HStack`, `HVStack`, `HGrid`, `HSplit`, `HSpacer`)

Core: `packages/core/src/layout-contract.ts`

Layout primitives are pure CSS composition helpers. They do **not** use Ark UI, Zag.js, TanStack, or any state machine.

The goal is to reduce repeated page layout CSS while keeping React / Vue / Web Component APIs aligned.

## Naming

| Primitive | React | Vue | Web Component | Core contract |
| --- | --- | --- | --- | --- |
| Container | `HContainer` | `HContainer` | `h-container` | `ContainerContract` |
| Horizontal stack | `HStack` | `HStack` | `h-stack` | `StackContract` |
| Vertical stack | `HVStack` | `HVStack` | `h-v-stack` | `VStackContract` |
| Grid | `HGrid` | `HGrid` | `h-grid` | `GridContract` |
| Split | `HSplit` | `HSplit` | `h-split` | `SplitContract` |
| Spacer | `HSpacer` | `HSpacer` | `h-spacer` | `SpacerContract` |

CSS classes stay `ui-*`: `ui-container`, `ui-stack`, `ui-v-stack`, `ui-grid`, `ui-split`, `ui-spacer`.

## Implementation rules

1. Do not use Ark UI, Zag.js, or TanStack for layout.
2. Do not create business templates like `DashboardLayout` in packages.
3. React / Vue / WC only map props to classes and CSS variables.
4. Responsive behavior must be CSS-driven. Do not listen to `resize` in JS.
5. Public API must work in Web Components, so responsive values use strings, not React-only objects.
6. Business pages can still write page-specific classes such as `admin-command__layout`.

## Responsive value grammar

All responsive props should accept exact tokens and mobile-first strings:

```tsx
<HGrid columns="1 md:2 lg:4" gap="sm md:lg" />
```

```html
<h-grid columns="1 md:2 lg:4" gap="sm md:lg"></h-grid>
```

Grammar:

- exact value: `"md"`, `"center"`, `"auto-fit"`, `3`
- breakpoint fragment: `"md:2"`, `"lg:4"`
- mobile-first string: `"1 md:2 lg:4"`

Breakpoints: `sm`, `md`, `lg`, `xl`.

Implementations may parse the string and set CSS variables/modifier classes per breakpoint. Keep the parser tiny and deterministic.

## `ContainerContract`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` or responsive string | `'xl'` | max inline size |
| `padded` | `boolean` | `true` | horizontal page padding |
| `center` | `boolean` | `true` | auto inline margins |

Example:

```tsx
<HContainer size="2xl" padded>
  ...
</HContainer>
```

## `StackContract` / `VStackContract`

`HStack` is horizontal. `HVStack` is vertical.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `gap` | `LayoutGap` or responsive string | `'md'` | child spacing |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` or responsive string | `'stretch'` | cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` or responsive string | `'start'` | main-axis distribution |
| `wrap` | `boolean` | `false` | `HStack` only |
| `reverse` | `boolean` | `false` | visual order only; do not mutate DOM order |

Example:

```tsx
<HStack gap="sm md:lg" align="center" justify="between" wrap>
  ...
</HStack>
```

## `GridContract`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `columns` | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 12 \| 'auto-fit' \| 'auto-fill'` or responsive string | `'auto-fit'` | grid column strategy |
| `minChildWidth` | `string` | `'240px'` | used by auto-fit / auto-fill |
| `gap` | `LayoutGap` or responsive string | `'md'` | row + column gap |
| `rowGap` | `LayoutGap` or responsive string | - | row gap override |
| `columnGap` | `LayoutGap` or responsive string | - | column gap override |
| `equalHeight` | `boolean` | `false` | stretch children per row |

Examples:

```tsx
<HGrid columns="auto-fit" minChildWidth="240px" gap="md">
  ...
</HGrid>
```

```tsx
<HGrid columns="1 md:2 lg:4" gap="sm md:lg">
  ...
</HGrid>
```

## `SplitContract`

`HSplit` is for main/side layouts. It expects two children/slots, but should not enforce business semantics.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `ratio` | `'1:1' \| '2:1' \| '1:2' \| '3:1' \| '1:3' \| '3:2' \| '2:3' \| 'sidebar-left' \| 'sidebar-right'` or responsive string | `'1:1'` | desktop split |
| `gap` | `LayoutGap` or responsive string | `'md'` | child spacing |
| `collapseBelow` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'never'` | `'md'` | one-column below breakpoint |
| `sidebarWidth` | `string` | `'320px'` | used by sidebar ratios |
| `align` | `LayoutAlign` or responsive string | `'stretch'` | cross-axis alignment |

Example:

```tsx
<HSplit ratio="2:1" collapseBelow="lg" gap="lg">
  <MainPanel />
  <SidePanel />
</HSplit>
```

## `SpacerContract`

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `size` | `LayoutGap`, CSS length, or responsive string | `'md'` | fixed spacer size |
| `grow` | `boolean` | `true` | fill available free space |

Example:

```tsx
<HStack>
  <Logo />
  <HSpacer />
  <UserMenu />
</HStack>
```

## Suggested CSS variables

Implementations should prefer CSS variables instead of large class matrices:

| Variable | Meaning |
| --- | --- |
| `--ui-layout-gap` | stack/grid/split gap |
| `--ui-container-size` | container max inline size |
| `--ui-grid-columns` | grid template columns |
| `--ui-grid-min` | min child width for auto-fit/auto-fill |
| `--ui-split-template` | split grid template columns |
| `--ui-sidebar-width` | sidebar width |
| `--ui-spacer-size` | spacer fixed size |

Theme owns the token values for gap/container sizes. Component implementations only map props to these variables.

## Implementation map

| Layer | Path |
| --- | --- |
| Contract | `packages/core/src/layout-contract.ts` |
| Parse / CSS value maps | `packages/core/src/layout-utils.ts` |
| className + style builders (pure) | `packages/core/src/layout-style.ts` |
| Theme skins + breakpoints | `packages/theme/src/components.css` (layout section) + space tokens in `themes/default.css` |
| React | `HContainer` / `HStack` / `HVStack` / `HGrid` / `HSplit` / `HSpacer` |
| Vue | same names under `packages/vue/src/` |
| Web Components | one file per tag: `h-container.ts` … `h-spacer.ts` |
| WC DOM helpers | `packages/web-components/src/layout-shared.ts` (`applyLayout` / `boolAttr`; **not** in core) |
| Playground | `#/layout` · `playground/src/views/layout.tsx` |

Responsive cascade is pure CSS (`@media min-width` + fallback chains on `--ui-*-sm|md|lg|xl`). JS only parses the string once when props change.
