import type { InjectionKey, Ref } from 'vue'

/**
 * Injected by HForm.vue — a flat map of path → error message.
 * FormField reads this to display validation errors via Field.ErrorText.
 */
export const FORM_ERRORS_KEY: InjectionKey<Ref<Record<string, string>>> = Symbol('formErrors')

/** Injected by HForm.vue — set of paths that have been touched (blurred or submitted). */
export const TOUCHED_KEY: InjectionKey<Ref<Set<string>>> = Symbol('touched')

/** Injected by HForm.vue — validate a single field path, returns error string ('' if valid). */
export const VALIDATE_FIELD_KEY: InjectionKey<(path: string) => string> = Symbol('validateField')

/** Per-field layout metadata collected from JSON Schema x-* annotations. */
export interface FieldLayoutMeta {
  /** x-row — fields sharing the same row id are grouped into an HStack row. */
  row?: string
  /** x-span — flex-grow weight within an HStack row (default 1). span=2 = twice the width. */
  span?: number
  /** x-col-span — grid column span (only meaningful inside an x-layout: grid group). */
  colSpan?: number
}

/** Injected by HForm.vue — flat map of path → layout metadata for FormNode grouping. */
export const LAYOUT_MAP_KEY: InjectionKey<Record<string, FieldLayoutMeta>> = Symbol('layoutMap')

/** Group-level layout configuration (x-layout / x-grid-columns / title). */
export interface GroupLayoutMeta {
  label?: string
  layout?: string
  gridColumns?: number | string
}

/**
 * Injected by HForm.vue — flat map of group path → group-level layout config.
 * meshflow uiSchema nodes are frozen proxies so we carry x-layout /
 * x-grid-columns through a side-map instead of setting them on the node.
 */
export const GROUP_LAYOUT_KEY: InjectionKey<Record<string, GroupLayoutMeta>> = Symbol('groupLayout')

/**
 * Injected by HForm.vue — flat map of path → { step?, max? } for custom
 * x-step / x-max schema annotations.  meshflow internal-form only maps a
 * standard subset (min, maxLength); we carry the rest through this side map.
 */
export const SCHEMA_EXTRAS_KEY: InjectionKey<Record<string, { step?: number; max?: number }>> = Symbol('schemaExtras')
