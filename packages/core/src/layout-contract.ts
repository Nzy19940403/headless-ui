/**
 * Layout primitive contracts.
 *
 * Layout is not a headless state-machine problem. These contracts define a
 * small cross-stack CSS primitive layer for React / Vue / Web Components.
 *
 * Implementation rule:
 * - React/Vue/WC map props to `ui-*` classes and CSS variables.
 * - Responsive behavior is CSS-driven; do not listen to resize in JS.
 * - Keep business page templates outside the package layer.
 */

export type LayoutBreakpoint = 'sm' | 'md' | 'lg' | 'xl'

export type LayoutGap = 'none' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'

export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export type LayoutContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export type LayoutGridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12 | 'auto-fit' | 'auto-fill'

export type LayoutSplitRatio =
  | '1:1'
  | '2:1'
  | '1:2'
  | '3:1'
  | '1:3'
  | '3:2'
  | '2:3'
  | 'sidebar-left'
  | 'sidebar-right'

/**
 * Cross-stack responsive value.
 *
 * Prefer string grammar so Web Components can use the same public API:
 *
 * - exact value: `"md"`, `"center"`, `3`
 * - mobile-first responsive string: `"1 md:2 lg:4"`
 * - token responsive string: `"sm md:lg xl:2xl"`
 *
 * Implementations should parse breakpoint fragments and emit CSS variables /
 * modifier classes. React/Vue may accept numbers directly, but must also accept
 * the string grammar used by Web Components.
 */
export type LayoutResponsiveValue<T extends string | number> = T | `${T}` | string

export interface ContainerContract {
  /**
   * Max inline size token. `full` means no max-width.
   * Default: `xl`.
   */
  size?: LayoutResponsiveValue<LayoutContainerSize>
  /**
   * Apply horizontal page padding.
   * Default: true.
   */
  padded?: boolean
  /**
   * Center the container with auto inline margins.
   * Default: true.
   */
  center?: boolean
}

export interface StackContract {
  gap?: LayoutResponsiveValue<LayoutGap>
  align?: LayoutResponsiveValue<LayoutAlign>
  justify?: LayoutResponsiveValue<LayoutJustify>
  wrap?: boolean
  /**
   * Collapse to a vertical column below this breakpoint.
   * `md` means the HStack becomes a column on phones/tablets.
   * Default: `never` (always horizontal).
   */
  stackBelow?: LayoutBreakpoint | 'never'
  reverse?: boolean
}

export interface VStackContract {
  gap?: LayoutResponsiveValue<LayoutGap>
  align?: LayoutResponsiveValue<LayoutAlign>
  justify?: LayoutResponsiveValue<LayoutJustify>
  reverse?: boolean
  /** Stretch to fill the block-size offered by the parent. */
  fillHeight?: boolean
}

export interface GridContract {
  /**
   * Fixed column count or auto-fit/auto-fill.
   *
   * Examples:
   * - `4`
   * - `"auto-fit"`
   * - `"1 md:2 lg:4"`
   */
  columns?: LayoutResponsiveValue<LayoutGridColumns>
  /**
   * Minimum child width used by `auto-fit` / `auto-fill`.
   * Any valid CSS length, e.g. `"220px"`, `"16rem"`.
   * Default: `240px`.
   */
  minChildWidth?: string
  /**
   * Shorthand gap between rows and columns.
   * Default: `md`.
   */
  gap?: LayoutResponsiveValue<LayoutGap>
  /**
   * Row gap override.
   */
  rowGap?: LayoutResponsiveValue<LayoutGap>
  /**
   * Column gap override.
   */
  columnGap?: LayoutResponsiveValue<LayoutGap>
  /**
   * Stretch children to the same block size in each row.
   * Default: false.
   */
  equalHeight?: boolean
}

export interface SplitContract {
  /**
   * Desktop split ratio.
   * Default: `1:1`.
   */
  ratio?: LayoutResponsiveValue<LayoutSplitRatio>
  /**
   * Gap between the primary and secondary regions.
   * Default: `md`.
   */
  gap?: LayoutResponsiveValue<LayoutGap>
  /**
   * Collapse to a single column below this breakpoint.
   * Default: `md`.
   */
  collapseBelow?: LayoutBreakpoint | 'never'
  /**
   * Sidebar width for `sidebar-left` / `sidebar-right`.
   * Any valid CSS length, e.g. `"280px"`, `"20rem"`.
   * Default: `320px`.
   */
  sidebarWidth?: string
  /**
   * Cross-axis alignment.
   * Default: `stretch`.
   */
  align?: LayoutResponsiveValue<LayoutAlign>
}

export interface SpacerContract {
  /**
   * Fixed spacer size. Token or CSS length.
   * Default: `md`.
   */
  size?: LayoutResponsiveValue<LayoutGap | string>
  /**
   * Grow to fill available flex/grid free space.
   * Default: true.
   */
  grow?: boolean
}
