/**
 * Augmented JSON Schema types for meshflow + headless-ui form components.
 *
 * meshflow's `MeshObjectSchema` only covers `x-layout?: 'vertical' | 'horizontal'`
 * and `x-order?: string[]`.  We extend it with our grid / span / row annotations
 * so downstream packages can read them without `as any` casts.
 */
import type { MeshFieldSchema, MeshObjectSchema } from '@meshflow/form'

/** Field schema with all supported x-* annotations. */
export interface FieldSchemaX extends MeshFieldSchema {
  'x-row'?: string
  'x-span'?: number
  'x-col-span'?: number
  'x-step'?: number
  'x-max'?: number
}

/** Object schema with layout / grid-columns annotations. */
export interface ObjectSchemaX extends Omit<MeshObjectSchema, 'properties' | 'x-layout'> {
  'x-layout'?: 'vertical' | 'horizontal' | 'grid'
  'x-grid-columns'?: number | string
  properties: Record<string, FieldSchemaX | ObjectSchemaX>
  [key: `x-${string}`]: unknown
}

/**
 * Type guard: narrow a union schema member to the object (group) branch.
 *
 * Helpful inside `Object.entries()` loops — some environments (e.g. Volar /
 * ts-plugin in .vue files) don't narrow discriminated unions through
 * `Object.entries()` as aggressively as `tsc`.
 */
export function isObjectSchema(
  f: FieldSchemaX | ObjectSchemaX,
): f is ObjectSchemaX {
  return f.type === 'object'
}
