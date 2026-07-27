/**
 * Pure helpers for layout primitives.
 * Map responsive string grammar → CSS custom properties (no resize listeners).
 */

export type LayoutBreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl'

const BREAKPOINTS = new Set(['sm', 'md', 'lg', 'xl'])

const GAP_TOKENS = new Set(['none', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'])

const CONTAINER_TOKENS = new Set(['sm', 'md', 'lg', 'xl', '2xl', 'full'])

/**
 * Parse mobile-first responsive grammar.
 *
 * - `"md"` → `{ base: "md" }`
 * - `"1 md:2 lg:4"` → `{ base: "1", md: "2", lg: "4" }`
 */
export function parseResponsiveInput(
  value: string | number | boolean | undefined | null,
): Partial<Record<LayoutBreakpointKey, string>> {
  if (value === undefined || value === null || value === '') return {}
  if (typeof value === 'boolean') return { base: String(value) }

  const raw = String(value).trim()
  if (!raw) return {}

  const out: Partial<Record<LayoutBreakpointKey, string>> = {}
  for (const part of raw.split(/\s+/)) {
    const colon = part.indexOf(':')
    if (colon === -1) {
      out.base = part
      continue
    }
    const bp = part.slice(0, colon)
    const token = part.slice(colon + 1)
    if (BREAKPOINTS.has(bp) && token) {
      out[bp as LayoutBreakpointKey] = token
    }
  }
  return out
}

/** Map gap token or raw CSS length → CSS value. */
export function gapCssValue(token: string): string {
  if (GAP_TOKENS.has(token)) return `var(--ui-space-${token})`
  return token
}

export function alignCssValue(token: string): string {
  switch (token) {
    case 'start':
      return 'flex-start'
    case 'end':
      return 'flex-end'
    case 'center':
    case 'stretch':
    case 'baseline':
      return token
    default:
      return token
  }
}

export function justifyCssValue(token: string): string {
  switch (token) {
    case 'start':
      return 'flex-start'
    case 'end':
      return 'flex-end'
    case 'center':
      return 'center'
    case 'between':
      return 'space-between'
    case 'around':
      return 'space-around'
    case 'evenly':
      return 'space-evenly'
    default:
      return token
  }
}

export function containerSizeCssValue(token: string): string {
  if (token === 'full') return 'none'
  if (CONTAINER_TOKENS.has(token)) return `var(--ui-container-${token})`
  return token
}

export function gridColumnsCssValue(token: string): string {
  if (token === 'auto-fit' || token === 'auto-fill') {
    return `repeat(${token}, minmax(var(--ui-grid-min, 240px), 1fr))`
  }
  const n = Number(token)
  if (Number.isFinite(n) && n > 0) {
    return `repeat(${n}, minmax(0, 1fr))`
  }
  return token
}

export function splitRatioCssValue(token: string): string {
  switch (token) {
    case '1:1':
      return '1fr 1fr'
    case '2:1':
      return '2fr 1fr'
    case '1:2':
      return '1fr 2fr'
    case '3:1':
      return '3fr 1fr'
    case '1:3':
      return '1fr 3fr'
    case '3:2':
      return '3fr 2fr'
    case '2:3':
      return '2fr 3fr'
    case 'sidebar-left':
      return 'var(--ui-sidebar-width, 320px) minmax(0, 1fr)'
    case 'sidebar-right':
      return 'minmax(0, 1fr) var(--ui-sidebar-width, 320px)'
    default:
      return token
  }
}

/** Spacer size: gap token or any CSS length. */
export function spacerSizeCssValue(token: string): string {
  return gapCssValue(token)
}

/**
 * Build a style map of CSS variables for a responsive value.
 *
 * `varBase` e.g. `--ui-layout-gap` → also sets `--ui-layout-gap-md` for breakpoints.
 */
export function responsiveVarStyle(
  varBase: string,
  value: string | number | undefined | null,
  mapValue: (token: string) => string,
): Record<string, string> {
  const parsed = parseResponsiveInput(value)
  const style: Record<string, string> = {}
  for (const [bp, token] of Object.entries(parsed) as [LayoutBreakpointKey, string][]) {
    if (!token) continue
    const mapped = mapValue(token)
    if (bp === 'base') style[varBase] = mapped
    else style[`${varBase}-${bp}`] = mapped
  }
  return style
}

/** Merge multiple style records (later keys overwrite). */
export function mergeStyles(
  ...parts: Array<Record<string, string | number | undefined> | undefined | null>
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of parts) {
    if (!part) continue
    for (const [k, v] of Object.entries(part)) {
      if (v === undefined || v === null || v === '') continue
      out[k] = String(v)
    }
  }
  return out
}
